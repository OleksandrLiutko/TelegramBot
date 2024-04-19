import EventEmitter from 'events'

import { TOKEN_ABI } from './abi/TOKEN_ABI.js'
import { ERC20_ABI } from './abi/ERC20_ABI.js'
import { Uniswap_V2_Pool_ABI } from './Uniswap_V2_Pool_ABI.js'
import { Uniswap_V3_Pool_ABI } from './Uniswap_V3_Pool_ABI.js'
import * as uniconst from './uni-catch/const.js'
import { checkCEXWallet as checkKycWalletFromDB } from './db.js'
import * as afx from './global.js'
import * as utils from './utils.js'
import * as advUtils from './adv_utils.js'
import * as ethscan_api from './etherscan-api.js'
import * as apiRepeater from './api_repeater.js'

const MAX_TRANSACTION_COUNT = 100

export const getFilteredUsers = (web3, tokenInfo, usersInDb) => {

	let users = []
	for (const user of usersInDb) {
		
		if (afx.FREE_TO_USE || user.wallet || user.vip === 1) {
			if (tokenInfo.secondaryAddress.toLowerCase() == afx.get_weth_address().toLowerCase()) {

				tokenInfo.initialLiquidity = parseFloat(web3.utils.fromWei(tokenInfo.secondaryAmount, "ether"))
				if (!user.init_eth || tokenInfo.initialLiquidity < parseFloat(user.init_eth)) {
					continue
				}

			} else if (tokenInfo.secondaryAddress.toLowerCase() == afx.get_usdt_address().toLowerCase() || tokenInfo.secondaryAddress.toLowerCase() == afx.get_usdc_address().toLowerCase()) {

				tokenInfo.initialLiquidity = parseFloat(web3.utils.fromWei(tokenInfo.secondaryAmount, "mwei"))
				if (!user.init_usd || tokenInfo.initialLiquidity < parseFloat(user.init_usd)) {
					continue
				}

			} else {
				continue
			}

			users.push(user)
		}
	}

	return users
}

export function waitForEvent(eventEmitter, eventName) {
	return new Promise(resolve => {
		eventEmitter.on(eventName, resolve)
	})
}

export async function getAddressInfo(web3, address) {
	const promises = []

	const addressInfo = {}
	try {

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
			.then(usdcBalance => addressInfo.usdcBalance = usdcBalance);

		promises.push(transactionCountPromise)
		promises.push(balancePromise)
		promises.push(wethBalancePromise)
		promises.push(usdtBalancePromise)
		promises.push(usdcBalancePromise)

		await Promise.all(promises)
	}catch (error) {
		console.log('getAddressInfo', error)
	}
	return addressInfo
}

export const getSecondaryTokenPrice = async (web3, tokenAddress) => {

	if (tokenAddress.toLowerCase() === afx.get_usdt_address().toLowerCase() || tokenAddress.toLowerCase() === afx.get_usdc_address().toLowerCase()) {
		return 1;
	} else if (tokenAddress.toLowerCase() === afx.get_weth_address().toLowerCase()) {

		return await utils.getEthPrice(web3);
	}

	return 0;
}

export async function waitBlock(web3, blockCount) {
	let last_error = null

	const eventEmitter = new EventEmitter()

	const subscription = web3.eth.subscribe('newBlockHeaders', (error, blockHeader) => {
		if (error) {
			last_error = error
			console.error(error)
			blockCount = 0
		}

		blockCount--

		if (blockCount <= 0) {
			subscription.unsubscribe((error, success) => {
				if (error) {
					console.error(error)
				}
			})
			eventEmitter.emit('event')
		}
	})

	await waitForEvent(eventEmitter, 'event')

	return last_error
}

async function waitSeconds(seconds) {
	const eventEmitter = new EventEmitter()

	setTimeout(() => {
		eventEmitter.emit('TimeEvent')
	}, seconds * 1000)

	await waitForEvent(eventEmitter, 'TimeEvent')
}

export async function filter(event, tokenInfo, result) {
	try {
		if (tokenInfo.version === 'v2') {
			if (!tokenInfo.primaryIndex) {
				if (Number(event.returnValues.amount0In)) {
					result.sellCount++
					result.sellAddresses.push(event.returnValues.sender)
					result.sellAmount += Number(event.returnValues.amount0In)
					result.sellBalance += Number(event.returnValues.amount1Out)
				} else if (Number(event.returnValues.amount1In)) {
					result.purchaseCount++
					result.purchaseAddresses.push(event.returnValues.to)
					result.purchaseAmount += Number(event.returnValues.amount0Out)
					result.purchaseBalance += Number(event.returnValues.amount1In)
				} else {
					console.log(event)
				}
			} else {
				if (Number(event.returnValues.amount1In)) {
					result.sellCount++
					result.sellAddresses.push(event.returnValues.sender)
					result.sellAmount += Number(event.returnValues.amount1In)
					result.sellBalance += Number(event.returnValues.amount0Out)
				} else if (Number(event.returnValues.amount0In)) {
					result.purchaseCount++
					result.purchaseAddresses.push(event.returnValues.to)
					result.purchaseAmount += Number(event.returnValues.amount1Out)
					result.purchaseBalance += Number(event.returnValues.amount0In)
				} else {
					console.log(event)
				}
			}
		} else if (tokenInfo.version === 'v3') {
			if (!tokenInfo.primaryIndex) {
				if (Number(event.returnValues.amount0) > 0) {
					result.sellCount++
					result.sellAddresses.push(event.returnValues.sender)
					result.sellAmount += Number(event.returnValues.amount0)
					result.sellBalance -= Number(event.returnValues.amount1)
				} else if (Number(event.returnValues.amount0) < 0) {
					result.purchaseCount++
					result.purchaseAddresses.push(event.returnValues.sender)
					result.purchaseAmount -= Number(event.returnValues.amount0)
					result.purchaseBalance += Number(event.returnValues.amount1)
				} else {
					console.log(event)
				}
			} else {
				if (Number(event.returnValues.amount1) > 0) {
					result.sellCount++
					result.sellAddresses.push(event.returnValues.sender)
					result.sellAmount += Number(event.returnValues.amount0)
					result.sellBalance -= Number(event.returnValues.amount1)
				} else if (Number(event.returnValues.amount1) < 0) {
					result.purchaseCount++
					result.purchaseAddresses.push(event.returnValues.sender)
					result.purchaseAmount -= Number(event.returnValues.amount0)
					result.purchaseBalance += Number(event.returnValues.amount1)
				} else {
					console.log(event)
				}
			}
		}
	} catch (error) {
		afx.error_log('filter', error)
	}
}
export const checkKycWallet = async (walletAddress, apiKey) => {
	if (afx.get_chain_id() === afx.Avalanche_ChainId) {
		return false;
	}
	try {

		const url = `${afx.get_apibaseurl()}/api?module=account&action=txlist&address=${walletAddress}&startblock=0&endblock=99999999&sort=desc&offset=${MAX_TRANSACTION_COUNT}&page=1`
		const resData = await ethscan_api.executeEthscanAPI(url, apiKey)
		const transactions = resData.result;

		if (!transactions) {
			return false;
		}

		for (const transaction of transactions) {
			if (!transaction.to || !transaction.from) {
				continue;
			}

			if (transaction.to.toLowerCase() === walletAddress.toLowerCase()) {
				if (await checkKycWalletFromDB(transaction.from)) {
					console.log("KYC wallet detected: ", walletAddress);
					return true;
				}
			}
		}
	} catch (error) {
		afx.error_log(`checkKycWallet`, error)
	}
	return false;
}
// export const start = async (web3, tokenInfo, filterCriteria, filterId) => {
export const start = async (web3, primaryContract, filterCriteria, poolInfo, filterId) => {
	try {
		let freshWalletCount = 0
		let freshTotalBalance = 0
		let whaleWalletCount = 0
		let whaleTotalBalance = 0

		for (const addressInfo of poolInfo.purchaseInfos) {
			const isFresh = addressInfo.transactionCount <= filterCriteria.maxFreshTransactionCount
	
			const totalBalance = (Number(addressInfo.balance) + Number(addressInfo.wethBalance)) * Number(poolInfo.ethPrice) / 10 ** 18
					+ (Number(addressInfo.usdtBalance) + Number(addressInfo.usdcBalance)) / 10 ** 6
			const isWhale = totalBalance >= filterCriteria.minWhaleBalance
	
			if (isFresh) {
				freshTotalBalance += totalBalance
				freshWalletCount++
			}
			if (isWhale) {
				whaleTotalBalance += totalBalance
				whaleWalletCount++
			}
		}

		if (filterCriteria.minFreshWalletCount && freshWalletCount < filterCriteria.minFreshWalletCount) {
			console.log(`[${filterId}] Fresh wallet count is ${freshWalletCount} which is less than ${filterCriteria.minFreshWalletCount}`)
			return
		}

		if (filterCriteria.minWhaleWalletCount && whaleWalletCount < filterCriteria.minWhaleWalletCount) {
			console.log(`[${filterId}] Whale wallet count is ${whaleWalletCount} which is less than ${filterCriteria.minWhaleWalletCount}`)
			return
		}

		if (filterCriteria.minKycWalletCount > 0 && poolInfo.kycWalletCount < filterCriteria.minKycWalletCount) {
			console.log(`[${filterId}] KYC wallet count is less than ${filterCriteria.minKycWalletCount}`)
			return
		}


		if (poolInfo.lpStat.lpLocked === false && filterCriteria.lpLock === 1) {
			console.log(`[${filterId}] The call has been skipped due to lp lock filter on`)
			return
		}


		if (poolInfo.honeypotStat.honeypot === true && filterCriteria.honeypot === 1) {
			console.log(`[${filterId}] The call has been skipped due to honeypot filter on`)
			return
		}


		if (filterCriteria.contractAge > 0 && poolInfo.contractAgeStat.contractAge < filterCriteria.contractAge) {
			console.log(`[${filterId}] The call has been skipped due to contract age filter on`)
			return
		}

		const poolHistoryInfo = {
			initialLiquidity: poolInfo.initialLiquidity,
			freshWalletCount: freshWalletCount,
			lp_lock: poolInfo.lpStat.lpLocked,
			honeypot: !poolInfo.honeypotStat.honeypot,
			whaleWalletCount: whaleWalletCount,
			kycWalletCount: poolInfo.kycWalletCount
		}
		
	//🏠 Token address: <code class="text-entity-code">${tokenInfo.primaryAddress}</code>
		const content0 =
			`🔎 On-Chain Alpha Scanner | ${process.env.BOT_TITLE} 🎖

New potential gem found!

📛 Name: ${poolInfo.primaryInfo.name} ($${poolInfo.primaryInfo.symbol})
💧 Initial Liquidity: ${utils.roundDecimal(poolInfo.initialLiquidity, 3)} ${poolInfo.secondaryInfo.symbol} | ${poolInfo.lpStat.message}
📎 Token address: <code>${poolInfo.tokenInfo.primaryAddress}</code>
📊 MCap: $ ${utils.roundDecimal(poolInfo.marketCap, 2)}
📈 Current Liquidity: ${utils.roundDecimal(poolInfo.currentLiquidity, 3)} ${poolInfo.secondaryInfo.symbol}
🐋 Whales: ${whaleWalletCount} ($ ${utils.roundDecimal(whaleTotalBalance, 2)})
💸 Freshes: ${freshWalletCount} ($ ${utils.roundDecimal(freshTotalBalance, 2)})
🏦 KYC: More than ${poolInfo.kycWalletCount} wallets
📃 Contract Source: ${poolInfo.contractVerified ? 'Verified' : 'Unverified'} ${poolInfo.ownershipRenouncedMsg}
${poolInfo.contractAgeStat.message}
${poolInfo.honeypotStat.message}
💹 Chart: <a href="https://dexscreener.com/${afx.get_dexscreener_name()}/${poolInfo.tokenInfo.primaryAddress}">Dexscreener</a> - <a href="https://www.dextools.io/app/en/${afx.get_dextools_name()}/pair-explorer/${poolInfo.tokenInfo.poolAddress}">DexTools</a> | <a href="${process.env.TEAM_TELEGRAM}">Contact Team</a>`

		const tag = ``

		const message = {content0, tag, poolHistoryInfo}

		console.log(content0)

		return message
	} catch (error) {
		console.log(error)
		afx.error_log(`[${filterId}] filter.start`, error)
	}
}