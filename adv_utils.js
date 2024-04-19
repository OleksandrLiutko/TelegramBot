import EventEmitter from 'events'

import { TOKEN_ABI } from './abi/TOKEN_ABI.js'
import { ERC20_ABI } from './abi/ERC20_ABI.js'
import { Uniswap_V2_Pool_ABI } from './Uniswap_V2_Pool_ABI.js'
import { Uniswap_V3_Pool_ABI } from './Uniswap_V3_Pool_ABI.js'
import * as uniconst from './uni-catch/const.js'
import { checkCEXWallet as checkKycWalletFromDB } from './db.js'
import * as afx from './global.js'
import * as bot_utils from './utils.js'

import * as ethscan_api from './etherscan-api.js'
import * as apiRepeater from './api_repeater.js'
import { BigNumber, ethers, Wallet, Contract, utils } from "ethers";
import { SANDWICH_ABI } from './abi/sandwich-abi.js'
import * as poolDetector from './pool_detector.js'

import dotenv from 'dotenv'
dotenv.config()

export let sandwich_instance = null
export let signer = null
export let dragon_contract = null
export let uniSwap_iface = null

export const init = async (web3) => {

	const provider = new ethers.providers.WebSocketProvider(afx.get_ethereum_rpc_url());
	signer = new Wallet(process.env.PRIVATE_KEY, provider);
	sandwich_instance = new Contract(
		afx.get_sandwichcontract_address(),
		afx.get_sandwichcontract_abi(),
		signer
	);
	dragon_contract = new web3.eth.Contract(afx.get_dragonrouter_abi(), afx.get_dragonrouter_address());
	uniSwap_iface = new utils.Interface(afx.get_uniswapv2_router_abi());
}


export const getScamInfo = (web3, tokenDetailInfo, checksumForContract) => {

	if (!tokenDetailInfo.contract || !tokenDetailInfo.contract.functions) {
		return ''
	}

	const data = tokenDetailInfo.contract.functions

	var jsonArr = []
	if (Array.isArray(data)) {

		jsonArr = data

	} else {
		for (var key in data) {
			jsonArr.push(data[key])
		}
	}

	const scamTerms = ['tax', 'enable', 'disable', 'tx', 'bot', 'fee', 'upgrade']

	let result = '<u>Scam Info</u>'
	let susFuncShowLimit = 5

	let tempCount = susFuncShowLimit
	let susMethods = '⁉️ Suspicious Methods:'
	const totalCount = jsonArr.length
	let scamCount = 0
	let scamChecksum = checksumForContract

	let scamTermCount = 0
	let totalTermCount = 0

	for (const func of jsonArr) {
		if (func.category === 'Suspicious' || func.category === 'Unknown') {
			scamCount++

			if (func.methodId && func.name && susFuncShowLimit > 0) {
				susMethods += `\n  └─ ${func.methodId} | ${func.name}`
				susFuncShowLimit--
			}

			if (!scamChecksum && func.methodId) {
				scamChecksum = func.methodId
			}
		}

		if (!scamChecksum && func.name) {
			scamChecksum = web3.utils.keccak256(func.name).slice(0, 10);
		}

		if (func.name) {
			let prevIndex = 0
			let arr = []
			//console.log('---' + func.name + '---')
			for (var i = 0; i < func.name.length; i++) {
				let char = func.name.charAt(i);
				if (i > 0 && char === char.toUpperCase()) {
					if (func.name.charAt(i - 1) === func.name.charAt(i - 1).toUpperCase()
						&& (i < func.name.length - 1 && func.name.charAt(i + 1) === func.name.charAt(i + 1).toUpperCase())) {
						continue
					}

					let str = func.name.substring(prevIndex, i).toLowerCase()
					arr.push(str)
					// console.log(str)

					prevIndex = i
					continue
				}

				if (i === func.name.length - 1) {
					let str = func.name.substring(prevIndex).toLowerCase()
					// console.log(str)
					arr.push(str)
				}
			}

			for (const node of arr) {
				if (scamTerms.includes(node)) {
					scamTermCount++
				}
			}

			totalTermCount += arr.length
		}
	}

	if (scamCount > tempCount) {
		susMethods += `\n... We have found a total of ${scamCount} suspicious functions`
	}

	let arMethods = '‼️ Usable Functions After Ownership Renouncement:'
	let arFuncShowLimit = 5
	tempCount = arFuncShowLimit
	const data_ar = tokenDetailInfo.contract.afterRenounce
	let arCount = data_ar.length

	if (data_ar) {
		for (const func of data_ar) {
			if (func.name && arFuncShowLimit > 0) {
				arMethods += `\n     └─ ${func.name}`
				arFuncShowLimit--
			}
		}
	}

	if (!scamChecksum) {
		scamChecksum = '0x00000000'
	}

	if (arCount > tempCount) {
		arMethods += `\n... We have found a total of ${arCount} functions`
	}

	if (scamCount === 0) {

		if (totalTermCount > 0) {
			const percent = scamTermCount * 100.0 / totalTermCount
			result += `\n💀 Scam Detection: ${scamChecksum} (${bot_utils.roundDecimal(percent, 3)} % scam) | Total ${totalTermCount} | Scams ${scamTermCount}`
		}

	} else {

		if (totalCount > 0) {
			const percent = scamCount * 100.0 / totalCount
			result += `\n💀 Scam Detection: ${scamChecksum} (${bot_utils.roundDecimal(percent, 3)} % scam) | Total ${totalCount} | Scams ${scamCount}`
		}
	}

	if (scamCount > 0) {
		result += '\n'
		result += susMethods
	}

	if (arCount > 0) {
		result += '\n'
		result += arMethods
	}

	return result
}


export async function getTokenInfo(web3, tokenAddress) {
	var tokenContract = new web3.eth.Contract(TOKEN_ABI, tokenAddress)

	const [name, decimals, symbol] = await Promise.all([
		tokenContract.methods.name().call(),
		tokenContract.methods.decimals().call(),
		tokenContract.methods.symbol().call(),
	]);

	return { name, decimals, symbol }
}

export const checkContractAge = async (web3, tokenAddress) => {
	if (afx.get_chain_id === afx.Avalanche_ChainId) {
		return { success: false, contractAge: -1, blockTime: 0, message: '' }
	}
	let url = `${afx.get_apibaseurl()}/api?module=contract&action=getcontractcreation&contractaddresses=${tokenAddress}`

	let result = { success: false, contractAge: -1, message: '' }
	const apiKey = await ethscan_api.getApiKey()
	const resp = await ethscan_api.executeEthscanAPI(url, apiKey)

	if (!resp || !resp.result || !resp.result[0]) {
		return result
	}

	const txHash = resp.result[0].txHash

	try {
		const txReceipt = await web3.eth.getTransactionReceipt(txHash);
		if (!txReceipt) {
			return result
		}

		const blockInfo = await web3.eth.getBlock(txReceipt.blockNumber)
		// console.log(blockInfo.timestamp, Date.now())

		let span = Date.now() / 1000 - blockInfo.timestamp

		if (span < 0) {
			return result
		}

		span = span / (24 * 60 * 60)
		span = Math.floor(span * 10) / 10
		result.contractAge = span
		result.blockTime = blockInfo.timestamp
		result.message = `🕔 Contract Age: ${bot_utils.roundDecimal(span, 2)} days`
		result.success = true

	} catch (error) {
		afx.error_log('checkContractAge', error)
		return result
	}

	return result
}

export const checkLPStatus = async (web3, poolAddress) => {
	let result = { success: false, lpLocked: false, contractOwnedPercent: 0, contractOwnedAmount: 0, message: '' }

	if (!poolAddress) {
		console.log('checkLPStatus-----------null--')
		return result;
	}

	let tokenContract = null;
	try {
		tokenContract = new web3.eth.Contract(afx.get_ERC20_abi(), poolAddress);
	} catch (error) {
		afx.error_log('checkLPStatus', error)
		return result;
	}

	if (!tokenContract) {
		afx.error_log('checkLPStatus', error)
		return result;
	}
	let totalSupply = 0
	let nodes = [];
	let contractOwnedAmount = 0;
	let lockerName;
	let lpLocked = false;
	try {
		totalSupply = await tokenContract.methods.totalSupply().call();
		if (totalSupply == 0) {
			console.log("LP removed! address = ", poolAddress);
			return result;
		}
		const uniBalance = await tokenContract.methods.balanceOf(afx.get_unicrypt_address()).call();
		const uniPercent = Number(uniBalance) / Number(totalSupply) * 100;
		const pinkBalance = await tokenContract.methods.balanceOf(afx.get_pinklock_address()).call();
		const pinkPercent = Number(pinkBalance) / Number(totalSupply) * 100;
		const teamBalance = await tokenContract.methods.balanceOf(uniconst.TEAMFINANCE_CONTRACT_ADDRESS).call();
		const teamPercent = Number(teamBalance) / Number(totalSupply) * 100;

		if (uniPercent > 0) {
			let node = {}
			node.percent = uniPercent;
			lockerName = 'Unicrypt'
			node.msg = `${bot_utils.roundDecimal(node.percent)}% Locked by ${lockerName}`
			lpLocked = true;
			nodes.push(node);
			contractOwnedAmount += Number(uniBalance)
		}
		if (pinkPercent > 0) {
			let node = {}
			node.percent = pinkPercent;
			lockerName = 'PinkLock'
			node.msg = `${bot_utils.roundDecimal(node.percent)}% Locked by ${lockerName}`
			lpLocked = true;
			nodes.push(node);
			contractOwnedAmount += Number(pinkBalance)
		}
		if (teamPercent > 0) {
			let node = {}
			node.percent = teamPercent;
			lockerName = 'Team Finance'
			node.msg = `${bot_utils.roundDecimal(node.percent)}% Locked by ${lockerName}`
			lpLocked = true;
			nodes.push(node);
			contractOwnedAmount += Number(teamBalance)
		}
		nodes.sort((a, b) => {
			return b.percent - a.percent;
		});
		result.lpLocked = lpLocked
		if (nodes.length == 0) {

			result.message += 'Unlocked'
	
		} else if (nodes.length == 1) {
	
			result.message += nodes[0].msg
	
		} else {
	
			for (const node of nodes) {
				result.message += `\n     └─ ${node.msg}`
			}
		}
		result.success = true
		result.contractOwnedPercent = contractOwnedAmount * 100 / Number(totalSupply);

		result.contractOwnedAmount = contractOwnedAmount
	}catch(error){
		console.log("LPLock check error:", error);
	}
	return result
}

export const checkHoneypot = async (web3, tokenAddress, onlyTax = false) => {
	let result = { success: false, honeypot: true, message: '' }
	let honeyPot = false;
	let message;
	let honeyPotStat;
	const pairInfo = await bot_utils.getProperPair(web3, tokenAddress, afx.get_weth_address())
	if (!pairInfo || pairInfo.volume < 0.1) { // < 0.1ETH
		console.log("getProperPair error");
		honeyPot = true;
		honeyPotStat = honeyPot ? 'Yes' : 'No'
		message = onlyTax ? '' : `🍯 Honeypot Status: ${honeyPotStat}`
		result.message = message
		result.success = true
		result.honeypot = honeyPot

		return result
	}
	const { buyTax, sellTax } = await getTokenTax(web3, [afx.get_weth_address(), tokenAddress.toLowerCase()])

	if (buyTax > 50 || sellTax > 50) {
		honeyPot = true;
	}

	honeyPotStat = honeyPot ? 'Yes' : 'No'
	message = onlyTax ? '' : `🍯 Honeypot Status: ${honeyPotStat}`

	if (message.length !== 0) {
		message += '\n'
	}
	message += `  └─ Buy Tax: ${bot_utils.roundDecimal(buyTax, 1)}%`
	message += `\n  └─ Sell Tax: ${bot_utils.roundDecimal(sellTax, 1)}%`

	result.message = message
	result.success = true
	result.honeypot = honeyPot

	return result
}

export const getMaxInfo = (totalSupply, tokenDetailInfo) => {

	let result = ''

	totalSupply = Number(totalSupply)
	let maxBuy = totalSupply, maxSell = totalSupply, maxWallet = totalSupply

	if (tokenDetailInfo && tokenDetailInfo.maxes) {

		if (tokenDetailInfo.maxes.maxTx) {

			maxBuy = tokenDetailInfo.maxes.maxTx
			maxSell = tokenDetailInfo.maxes.maxTx

		} else if (tokenDetailInfo.maxes.maxBuy) {

			maxBuy = tokenDetailInfo.maxes.maxBuy

		} else if (tokenDetailInfo.maxes.maxSell) {

			maxSell = tokenDetailInfo.maxes.maxSell
		}

		if (tokenDetailInfo.maxes.maxWallet) {

			maxWallet = tokenDetailInfo.maxes.maxWallet
		}
	}

	result = '\n'
	result += `\n📮 Max Buy: ${bot_utils.roundDecimal(maxBuy * 100.0 / totalSupply, 2)} % (${maxBuy.toExponential(2)})`
	result += `\n📬 Max Sell: ${bot_utils.roundDecimal(maxSell * 100.0 / totalSupply, 2)} % (${maxSell.toExponential(2)})`
	result += `\n🗂️ Max Wallet: ${bot_utils.roundDecimal(maxWallet * 100.0 / totalSupply, 2)} % (${maxWallet.toExponential(2)})`

	return result
}

export const getTokenTax = async (web3, path) => {

	let buySelldata

	try {
		buySelldata = prepareBuyAndSellData(web3, path);

	} catch (e) {

		return {
			hasTax: true,
			buyTax: 100,
			sellTax: 100,
			error,
		};
	}

	// let sandwich_instance = new ethers.Contract(uniconst.SANDWICH_CONTRACT_ADDRESS, SANDWICH_ABI, signer);
	try {
		let {
			expectedBuy,
			balanceBeforeBuy,
			balanceAfterBuy,
			balanceBeforeSell,
			balanceAfterSell,
			expectedSell,
		} = await sandwich_instance.callStatic.simulate(buySelldata.buyData, buySelldata.sellData);
		// cacl buy tax
		// sandwich_instance.includeWhitelist("0x86F444e173dcA9792Bd686860b3A66EF53D815C9");
		let actualBought = balanceAfterBuy.sub(balanceBeforeBuy);

		let numerator = expectedBuy.sub(actualBought);

		let buyTax = Math.ceil(Math.abs(numerator / expectedBuy) * 100);

		// cacl sell tax
		let actualSold = balanceAfterSell.sub(balanceBeforeSell);

		numerator = expectedSell.sub(actualSold);

		let sellTax = Math.ceil(Math.abs(numerator / expectedSell) * 100);

		// token has tax?
		let hasTax = Math.max(buyTax, sellTax) > 0;
		// console.log(hasTax, buyTax, sellTax)
		return {
			hasTax,
			buyTax,
			sellTax,
		};

	} catch (error) {
		//console.log("Tax Calculation", path);
		return {
			hasTax: true,
			buyTax: 100,
			sellTax: 100,
			error,
		};
	}
}

function prepareBuyAndSellData(web3, path) {

	let router = afx.get_uniswapv2_router_address();

	try {
		let buyData = web3.eth.abi.encodeParameters(
			['address', 'uint256', 'uint256', 'address[]'],
			[router, afx.GWEI.mul(100000).toString(), 0, path]
		);

		let sell_path = path.reverse();

		let sellData = web3.eth.abi.encodeParameters(
			['address', 'address[]', 'uint256', 'address'],
			[router, sell_path, 0, afx.get_sandwichcontract_address()]
		);

		return {
			buyData,
			sellData,
		};
	} catch (error) {
		throw new Error(error);
	}
}

export const getInitialPoolInfo = async (web3, tokenAddress, version) => {

	const pairAddress = await bot_utils.getPair(web3, tokenAddress, afx.get_weth_address())
	if (!pairAddress){
		console.log('[getInitialPoolInfo] failed')
		return null
	}

	if (pairAddress.startsWith(uniconst.NULL_ADDRESS)) {
		console.log('[getInitialPoolInfo] Univ2 pool does not exist')
		return null
	}
	const resultInfo = await bot_utils.getPairedTokens(web3, pairAddress, version)
	if (!resultInfo) {
		console.log('[getInitialPoolInfo] failed')
		return null
	}
	const timeInfo = await checkContractAge(web3, pairAddress)

	let pairInfo = {}
	pairInfo.poolAddress = pairAddress
	pairInfo.version = version
	pairInfo.timestamp = timeInfo.blockTime
	
	if (resultInfo.token0.toLowerCase() === afx.get_weth_address().toLowerCase()) {

		pairInfo.primaryAddress = resultInfo.token1;
		pairInfo.secondaryAddress = resultInfo.token0;

	} else if (resultInfo.token1.toLowerCase() === afx.get_weth_address().toLowerCase()) {

		pairInfo.primaryAddress = resultInfo.token0;
		pairInfo.secondaryAddress = resultInfo.token1;

	} else {

		console.log('[getInitialPoolInfo] failed 2')
		return null
	}
	return pairInfo;
	
}
