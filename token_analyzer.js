import EventEmitter from 'events'

import { TOKEN_ABI } from './abi/TOKEN_ABI.js'
import { ERC20_ABI } from './abi/ERC20_ABI.js'
import { Uniswap_V2_Pool_ABI } from './Uniswap_V2_Pool_ABI.js'
import { Uniswap_V3_Pool_ABI } from './Uniswap_V3_Pool_ABI.js'
import { UNISWAP_V2_FACTORY_ABI } from './abi/uniswapv2-factory-abi.js'
import { UNISWAP_V3_FACTORY_ABI } from './abi/uniswapv3-factory-abi.js'
import * as uniconst from './uni-catch/const.js'
import { checkCEXWallet as checkKycWalletFromDB } from './db.js'
import * as afx from './global.js'
import * as utils from './utils.js'
import * as advUtils from './adv_utils.js'
import * as ethscan_api from './etherscan-api.js'
import * as apiRepeater from './api_repeater.js'
import * as poolDetector from './pool_detector.js'
import {Concurrencer} from './concurrencer.js'

const MAX_TRANSACTION_COUNT = 100

async function getAddressInfo(web3, address) {
	const promises = []

	const addressInfo = {}

	const transactionCountPromise = web3.eth.getTransactionCount(address)
		.then(transactionCount => addressInfo.transactionCount = transactionCount)

	const balancePromise = web3.eth.getBalance(address)
		.then(balance => addressInfo.balance = balance)

	const wethTokenContract = new web3.eth.Contract(afx.get_ERC20_abi(), afx.get_weth_address())
	const wethBalancePromise = wethTokenContract.methods.balanceOf(address).call()
		.then(wethBalance => addressInfo.wethBalance = wethBalance)

	const usdtTokenContract = new web3.eth.Contract(afx.get_ERC20_abi(), afx.get_usdt_address())
	const usdtBalancePromise = usdtTokenContract.methods.balanceOf(address).call()
		.then(usdtBalance => addressInfo.usdtBalance = usdtBalance)

	const usdcTokenContract = new web3.eth.Contract(afx.get_ERC20_abi(), afx.get_usdc_address())
	const usdcBalancePromise = usdcTokenContract.methods.balanceOf(address).call()
		.then(usdcBalance => addressInfo.usdcBalance = usdcBalance)

	promises.push(transactionCountPromise)
	promises.push(balancePromise)
	promises.push(wethBalancePromise)
	promises.push(usdtBalancePromise)
	promises.push(usdcBalancePromise)

	await Promise.all(promises)

	return addressInfo
}

const getSecondaryTokenPrice = async (web3, tokenAddress) => {

	if (tokenAddress.toLowerCase() === afx.get_usdt_address().toLowerCase() || tokenAddress.toLowerCase() === afx.get_usdc_address().toLowerCase()) {
		return 1;
	} else if (tokenAddress.toLowerCase() === afx.get_weth_address().toLowerCase()) {

		return await utils.getEthPrice(web3);
	}

	return 0;
}

export const getInitialPoolInfo = async (web3, pairAddress, version) => {

	let pairInfo = { poolAddress: '' }


	const resultInfo = await utils.getPairedTokens(web3, pairAddress, version)
	if (!resultInfo) {
		console.log('[getInitialPoolInfo] failed')
	  	return pairInfo
	}

	pairInfo.poolAddress = pairAddress
	pairInfo.version = version

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

	return pairInfo
}

export const skeleton = async (web3, tokenAddress) => {

	try {

		const primaryInfo = await utils.getTokenInfoW(web3, tokenAddress)
		if (!primaryInfo) {
			return null
		}

		console.log('----------------------------3', primaryInfo)
		const checksumForContract = await utils.getContractVerified(web3, tokenAddress)
		const contractVerified = checksumForContract ? true : false

		const content0 =
			`⚡ Name: ${primaryInfo.name} ($${primaryInfo.symbol})
🏠 Token Address: <code>${tokenAddress}</code>
💰 Total Supply: ${utils.roundDecimal(primaryInfo.totalSupply, 2)} ${primaryInfo.symbol}
📃 Contract Source: ${contractVerified ? 'Verified' : 'Unverified'}

❕ No liquidity has been created for this token.

📊 Chart: <a href="https://dexscreener.com/${afx.get_dexscreener_name()}/${tokenAddress}">Dexscreener</a> - <a href="https://www.dextools.io/app/en/${afx.get_dextools_name()}/pair-explorer/${tokenAddress}">DexTools</a> | <a href="https://tokensniffer.com/token/eth/${tokenAddress}">Tokensniffer</a>`

const message = {content0}

		console.log(content0)

		return message
	} catch (error) {
		afx.error_log('token analyzer.skeleton', error)
	}
}

export const start = async (web3, tokenInfo, sendMsg) => {

	try {

		const primaryContract = new web3.eth.Contract(afx.get_ERC20_abi(), tokenInfo.primaryAddress)
		const secondaryContract = new web3.eth.Contract(afx.get_ERC20_abi(), tokenInfo.secondaryAddress)

		let tokenInfoObtainer = new Concurrencer()
		const obtainer_index_primaryInfo = tokenInfoObtainer.add(utils.getTokenInfoW(web3, tokenInfo.primaryAddress))
		const obtainer_index_secondaryInfo = tokenInfoObtainer.add(utils.getTokenInfoW(web3, tokenInfo.secondaryAddress))
		
		await tokenInfoObtainer.wait()
		const primaryInfo = await tokenInfoObtainer.getResult(obtainer_index_primaryInfo)
		if (!primaryInfo) {
			return
		}
		const secondaryInfo = await tokenInfoObtainer.getResult(obtainer_index_secondaryInfo)
		if (!secondaryInfo) {
			return
		}

		console.log(`Analysing token ...
Token: ${tokenInfo.primaryAddress}
Base: ${tokenInfo.secondaryAddress}
Pool: ${tokenInfo.poolAddress}
`)
		//sendMsg('Analyzing ...')

		let currentPrimaryAmount = await primaryContract.methods.balanceOf(tokenInfo.poolAddress).call()
		let owner = '0x1111';
		try {
			owner = await primaryContract.methods.owner().call()
		}catch (error) {
			console.log("getOwner function doesn't exist");
		}
		currentPrimaryAmount = Number(currentPrimaryAmount)
		let currentSecondaryAmount = await secondaryContract.methods.balanceOf(tokenInfo.poolAddress).call()
		currentSecondaryAmount = Number(currentSecondaryAmount)
		const primaryPriceBySecondary = currentSecondaryAmount / currentPrimaryAmount * 10 ** (Number(primaryInfo.decimal) - Number(secondaryInfo.decimal))
		const secondaryPriceByUSD = await getSecondaryTokenPrice(web3, tokenInfo.secondaryAddress)

		const primaryPriceByUSD = primaryPriceBySecondary * secondaryPriceByUSD
		const initialLiquidity = currentSecondaryAmount / (10 ** Number(secondaryInfo.decimal))

		let currentLiquidity = await secondaryContract.methods.balanceOf(tokenInfo.poolAddress).call()
		currentLiquidity /= 10 ** Number(secondaryInfo.decimal)

		let tokenBalance = currentPrimaryAmount / 10 ** Number(primaryInfo.decimal)
		const marketCap = Number(primaryInfo.totalSupply) * primaryPriceByUSD
		console.log("marketCap = ", marketCap);
		let advInfoObtainer = new Concurrencer()

		const obtainer_index_lpStat = advInfoObtainer.add(advUtils.checkLPStatus(web3, tokenInfo.poolAddress))
		const obtainer_index_honeyPot = advInfoObtainer.add(advUtils.checkHoneypot(web3, tokenInfo.primaryAddress))
		const obtainer_index_contractAge = advInfoObtainer.add(advUtils.checkContractAge(web3, tokenInfo.primaryAddress))
		const obtainer_index_contractVerified = advInfoObtainer.add(utils.getContractVerified(web3, tokenInfo.primaryAddress))

		await advInfoObtainer.wait()

		const lpStat = advInfoObtainer.getResult(obtainer_index_lpStat)

		let lpStatMsg = ''
		if (lpStat.success) {
			lpStatMsg = lpStat.message
		}

		let honeypotStat = advInfoObtainer.getResult(obtainer_index_honeyPot)

		let honeypotMsg = ''
		if (honeypotStat.success) {
			honeypotMsg = honeypotStat.message
		}
		console.log("honeypotMsg", honeypotMsg, honeypotStat.success, honeypotStat.message);
		const contractAgeStat = advInfoObtainer.getResult(obtainer_index_contractAge)

		let contractAgeMsg = ''
		if (afx.get_chain_id() !== afx.Avalanche_ChainId && contractAgeStat.success) {
			contractAgeMsg = contractAgeStat.message
		}

		const checksumForContract = advInfoObtainer.getResult(obtainer_index_contractVerified)

		const contractVerified = checksumForContract ? true : false

		let ownershipRenouncedMsg = '\n🔍 Ownership Renounced: ' + (owner.startsWith(uniconst.NULL_ADDRESS) ? 'Yes' : 'No')

//🏠 Token address: <code class="text-entity-code">${tokenInfo.primaryAddress}</code>
		const content0 =
			`⚡ Name: ${primaryInfo.name} ($${primaryInfo.symbol})
💧 Initial Liquidity: ${utils.roundDecimal(initialLiquidity, 3)} ${secondaryInfo.symbol}
🏠 Token Address: <code>${tokenInfo.primaryAddress}</code>
💰 Total Supply: ${utils.roundDecimal(primaryInfo.totalSupply, 2)} ${primaryInfo.symbol}

💰 Balance: ${utils.roundDecimal(tokenBalance, 2)} ${primaryInfo.symbol}
🏠 Liquidity: ${lpStatMsg}

💎 Marketcap: $ ${utils.roundDecimal(marketCap, 2)}
${honeypotMsg}
⚡ Max Buy: 100% Ξ 1.0e+9
⚡ Max Sell: 100% Ξ 1.0e+9
⚡ Max Wallet: 100% Ξ 1.0e+9
${ownershipRenouncedMsg}
${contractAgeMsg}
📃 Contract Source: ${contractVerified ? 'Verified' : 'Unverified'}

📊 Chart: <a href="https://dexscreener.com/${afx.get_dexscreener_name()}/${tokenInfo.primaryAddress}">Dexscreener</a> - <a href="https://www.dextools.io/app/en/${afx.get_dextools_name()}/pair-explorer/${tokenInfo.poolAddress}">DexTools</a> | <a href="${process.env.TEAM_TELEGRAM}">Contact Team</a>`

const message = {content0}

		// console.log(content0)

		return message
	} catch (error) {
		afx.error_log('token analyzer.start', error)
	}
}