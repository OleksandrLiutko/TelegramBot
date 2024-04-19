import Web3 from 'web3'
import * as filter from './filter.js'
import * as bot from './bot.js'
import * as utils from './utils.js'
import * as advUtils from './adv_utils.js'
import * as server from './server.js'
import * as poolDetector from './pool_detector.js'
import * as apiRepeater from './api_repeater.js'
import * as tokenAnalyzer from './token_analyzer.js'
import * as afx from './global.js'
import * as uniconst from './uni-catch/const.js'
import dotenv, { config } from 'dotenv'
dotenv.config()

import * as database from './db.js'

import * as dataHistory from './data_history.js'

import * as swapBot from './swap_v2.js'
import * as autoTrader from './auto_trader.js'

import * as sniper from './sniper_detector.js'
import EventEmitter from 'events'
import * as ethscan_api from './etherscan-api.js'

const options = {
	reconnect: {
		auto: true,
		delay: 5000, // ms
		maxAttempts: 5,
		onTimeout: false
	}
};

export const web3 = new Web3(new Web3.providers.WebsocketProvider(afx.get_ethereum_rpc_url(), options))
export const web3Http = new Web3(afx.get_ethereum_rpc_http_url());

let filter_count = 0
let filter_id = 0

const checkReliableToken = async (web3, tokenInfo, version) => {

	//console.log(tokenInfo)
	try {
		const usersInDb = await database.selectUsers({ type: 'private' })

		const poolId = await database.addPoolHistory(tokenInfo)
		if (poolId < 0) {
			console.log('[Error] Zero pool id detected')
			return
		}

		const filter_result = {
			purchaseCount: 0,
			sellCount: 0,
			purchaseAmount: 0,
			sellAmount: 0,
			purchaseBalance: 0,
			sellBalance: 0,
			purchaseAddresses: [],
			sellAddresses: [],
		}
		const primaryContract = new web3.eth.Contract(afx.get_ERC20_abi(), tokenInfo.primaryAddress)
		const secondaryContract = new web3.eth.Contract(afx.get_ERC20_abi(), tokenInfo.secondaryAddress)
		let owner = '0x1111';
		try {
			owner = await primaryContract.methods.owner().call()
		} catch (error) {
			console.log("getOwner function doesn't exist");
		}
		const primaryInfo = await utils.getTokenInfoW(web3, tokenInfo.primaryAddress)
		const secondaryInfo = await utils.getTokenInfoW(web3, tokenInfo.secondaryAddress)

		let poolContract
		if (tokenInfo.version === 'v2') {
			poolContract = new web3.eth.Contract(afx.get_uniswapv2_pool_abi(), tokenInfo.poolAddress)
		} else {//if (tokenInfo.version === 'v3') {
			poolContract = new web3.eth.Contract(afx.get_uniswapv3_pool_abi(), tokenInfo.poolAddress)
		}

		const eventEmitter = new EventEmitter()
		let last_error = null
		const subscription = poolContract.events.Swap({}, (error, event) => {
			if (error) {
				last_error = error
				console.error('Swap', error)
			}

			eventEmitter.emit('Swap')
		})

		console.log(`Waiting for first swap ...`);

		await filter.waitForEvent(eventEmitter, 'Swap')

		if (last_error) {
			console.log(`Filter ends with error 1`);
			return null
		}

		subscription.unsubscribe((error, success) => {
			if (error) {
				console.error('Swap unsubscribe', error)
			}
		})

		const startBlockNumber = await web3.eth.getBlockNumber()
		const blockThreshold = Number(process.env.BLOCK_THRESHOLD)
		last_error = await filter.waitBlock(web3, blockThreshold - 1)
		const endBlockNumber = await web3.eth.getBlockNumber() - 1
		if (last_error) {
			console.log(`Filter ends with error 2`);
			return
		}
		const events = await poolContract.getPastEvents('Swap', {
			fromBlock: startBlockNumber,
			toBlock: endBlockNumber,
		},);
		// (err, events) => {
		// 	console.log(events);
		// });
		console.log('Analyzing event ...')
		const promises = []
		for (const event of events) {
			const promise = filter.filter(event, tokenInfo, filter_result, version)
			promises.push(promise)
		}
		await Promise.all(promises)
		// let sniperPurchaseCount = sniper.getSnipers(tokenInfo.poolAddress)
		const purchaseAddresses = Array.from(new Set(filter_result.purchaseAddresses))
		const sellAddresses = Array.from(new Set(filter_result.sellAddresses))
		console.log('Checking liquidity status and honeyPot ...')
		let currentPrimaryAmount = await primaryContract.methods.balanceOf(tokenInfo.poolAddress).call()
		currentPrimaryAmount = Number(currentPrimaryAmount)
		if (currentPrimaryAmount == 0) {
			console.log('Liquidity was removed.')
			return
		}

		const lpStat = await advUtils.checkLPStatus(web3, tokenInfo.poolAddress)

		let honeypotStat = await advUtils.checkHoneypot(web3, tokenInfo.primaryAddress)
		const { buyTax, sellTax } = await advUtils.getTokenTax(web3, [afx.get_weth_address(), tokenInfo.primaryAddress])

		const contractAgeStat = await advUtils.checkContractAge(web3, tokenInfo.primaryAddress)

		const checksumForContract = await utils.getContractVerified(web3, tokenInfo.primaryAddress)
		const contractVerified = checksumForContract ? true : false

		let ownershipRenouncedMsg = '\n🔍 Ownership Renounced: ' + (owner.startsWith(uniconst.NULL_ADDRESS) ? 'Yes' : 'No')
		console.log("MacketCap calculating...");
		let currentSecondaryAmount = await secondaryContract.methods.balanceOf(tokenInfo.poolAddress).call()
		currentSecondaryAmount = Number(currentSecondaryAmount)
		const primaryPriceBySecondary = currentSecondaryAmount / currentPrimaryAmount * 10 ** (Number(primaryInfo.decimal) - Number(secondaryInfo.decimal))
		const secondaryPriceByUSD = await filter.getSecondaryTokenPrice(web3, tokenInfo.secondaryAddress)
		const primaryPriceByUSD = primaryPriceBySecondary * secondaryPriceByUSD
		const initialLiquidity = tokenInfo.secondaryAmount / (10 ** Number(secondaryInfo.decimal))
		const initialLiquidityFund = initialLiquidity * secondaryPriceByUSD
		let currentLiquidity = currentSecondaryAmount
		currentLiquidity /= 10 ** Number(secondaryInfo.decimal)

		const marketCap = primaryInfo.totalSupply * primaryPriceByUSD

		filter_result.purchaseAmount /= 10 ** Number(primaryInfo.decimal)
		filter_result.sellAmount /= 10 ** Number(primaryInfo.decimal)

		filter_result.purchaseBalance /= 10 ** Number(secondaryInfo.decimal)
		filter_result.sellBalance /= 10 ** Number(secondaryInfo.decimal)

		const users = filter.getFilteredUsers(web3, tokenInfo, usersInDb)
		console.log('Filtered status', usersInDb.length, '=>', users.length)
		const ethPrice = await utils.getEthPrice(web3)
		let kycWalletCount = 0;
		let purchaseInfos = [];
		let tokenHolderCount = 0;
		for (const address of purchaseAddresses) {
			const filterAddress = async (purchaseAddress) => {
				const addressInfo = await filter.getAddressInfo(web3, purchaseAddress)
				purchaseInfos.push(addressInfo);
				const primaryBalance = await primaryContract.methods.balanceOf(purchaseAddress).call()
				if (Number(primaryBalance) > 0) {
					tokenHolderCount++
				}
			}
			const apiKey = await ethscan_api.getApiKey()
			const checkKyc = await filter.checkKycWallet(address, apiKey)
			if (checkKyc) {
				kycWalletCount++;
			}
			const promise = filterAddress(address)

			promises.push(promise)
		}

		await Promise.all(promises)


		let poolInfo = {
			primaryInfo: primaryInfo,
			secondaryInfo: secondaryInfo,
			tokenInfo: tokenInfo,
			purchaseInfos: purchaseInfos,
			initialLiquidity: initialLiquidity,
			marketCap: marketCap,
			currentLiquidity: currentLiquidity,
			lpStat: lpStat,
			honeypotStat: honeypotStat,
			contractAgeStat: contractAgeStat,
			contractVerified: contractVerified,
			ownershipRenouncedMsg: ownershipRenouncedMsg,
			kycWalletCount: kycWalletCount,
			tokenHolderCount: tokenHolderCount,
			ethPrice: ethPrice,
		}

		while (users.length > 0) {
			const currentUsers = []
			const firstUser = users.shift()

			currentUsers.push(firstUser)

			for (let i = 0; i < users.length; i++) {
				if (firstUser.block_threshold === users[i].block_threshold
					&& firstUser.max_fresh_transaction_count === users[i].max_fresh_transaction_count
					&& firstUser.min_fresh_wallet_count === users[i].min_fresh_wallet_count
					&& firstUser.min_whale_balance === users[i].min_whale_balance
					&& firstUser.min_whale_wallet_count === users[i].min_whale_wallet_count
					&& firstUser.min_kyc_wallet_count === users[i].min_kyc_wallet_count
					&& firstUser.min_dormant_wallet_count === users[i].min_dormant_wallet_count
					&& firstUser.min_dormant_duration === users[i].min_dormant_duration
					&& firstUser.lp_lock === users[i].lp_lock
					&& firstUser.honeypot === users[i].honeypot
					&& firstUser.contract_age === users[i].contract_age
				) {

					currentUsers.push(users[i])

					users.splice(i, 1)
				}
			}

			const filterCriteria = {
				blockThreshold: firstUser.block_threshold,
				maxFreshTransactionCount: firstUser.max_fresh_transaction_count,
				minFreshWalletCount: firstUser.min_fresh_wallet_count,
				minWhaleBalance: firstUser.min_whale_balance,
				minWhaleWalletCount: firstUser.min_whale_wallet_count,
				minKycWalletCount: firstUser.min_kyc_wallet_count,
				minDormantWalletCount: firstUser.min_dormant_wallet_count,
				minDormantDuration: firstUser.min_dormant_duration,
				lpLock: firstUser.lp_lock,
				honeypot: firstUser.honeypot,
				contractAge: firstUser.contract_age,
			}

			filter_count++
			filter_id++
			const filterId = String(filter_id).padStart(5, '0');
			console.log('Filter started .. #' + filter_count);

			filter.start(web3, primaryContract, filterCriteria, poolInfo, filter_id)
				.then(async (filteredInfo) => {
					if (filteredInfo) {	// Fresh wallet criteria

						for (const currentUser of currentUsers) {
							bot.sendCallToAuthorizedUser(currentUser, filteredInfo, tokenInfo, poolId)
							await utils.sleep(20);
							// Auto buy
							// const tokenAutoTrades = await database.selectAutoSellTokens({chatid: currentUser.chatid})
							// if (tokenAutoTrades.length >= afx.Max_Auto_Trading_Count) {
							// 	continue;
							// }
							if (currentUser.trade_autobuy && currentUser.trade_autobuy_amount) {
								if (session.snipe_max_buy_tax >= 0 && tokenTax.buyTax > session.snipe_max_buy_tax) {
									continue;
								}
								if (session.snipe_max_sell_tax >= 0 && tokenTax.sellTax > session.snipe_max_sell_tax) {
									continue;
								}
								if (buyTax > currentUser.snipe_buy_slippage || sellTax > currentUser.snipe_sell_slippage) {
									bot.sendMessage(currentUser.chatid, `😢 Sorry, This token has ${buyTax} % buy tax, so you might need to increase the slippage.`)
									continue;
								}

								bot.sendMessage(session.chatid, `✴️ Trading Auto-Buy Snippet triggered.
				Name: ${primaryInfo.name} (${primaryInfo.symbol})
				Token Address: <code>${tokenInfo.primaryAddress}</code>
				Pair Address: <code>${tokenInfo.poolAddress}</code>
				Amount: ${utils.roundDecimal(currentUser.trade_autobuy_amount, 2)} ${afx.get_chain_symbol()}`)
								await autoTrader.autoSwap_Buy(web3Http, database, bot, currentUser, tokenInfo.primaryAddress, currentUser.trade_autobuy_amount, afx.get_chain_symbol(), version)
							}

							if (currentUser.wallet || currentUser.vip === 1) {
								database.addCallHistory(currentUser.chatid, filteredInfo.poolHistoryInfo, tokenInfo)
							}
						}
					}

					filter_count--
					console.log(`[${filterId}] Filter finished .. #` + filter_count);

					if (filter_count === 0) {
						filter_id = 0
					}
				})
		}
	} catch (error) {
		console.log("Analyzing error", error);
	}
}

const checkSnipers = async (web3, tokenInfo, version) => {

	let myDetector = new sniper.SniperDetector(web3, tokenInfo.poolAddress, tokenInfo.primaryAddress, tokenInfo.secondaryAddress, version,
		async (message, snipers) => {
			for (const [chatid, session] of bot.sessions) {
				if (session.min_sniper_count > 0 && snipers >= session.min_sniper_count) {
					//bot.sendPhotoMessageToAuthorizedUser(session, message, null)
				}
			}
		})

	myDetector.start()
}

const performSnipping = async (web3, tokenInfo, version) => {
	try {
		console.log("SniperStart");
		const tokens = await database.selectTokenSnipping({})
		const primaryAddressLo = tokenInfo.primaryAddress.toLowerCase()

		const primaryContract = new web3.eth.Contract(afx.get_ERC20_abi(), tokenInfo.primaryAddress)
		const secondaryContract = new web3.eth.Contract(afx.get_ERC20_abi(), tokenInfo.secondaryAddress)
		const primaryInfo = await utils.getTokenInfoW(web3, tokenInfo.primaryAddress)
		const secondaryInfo = await utils.getTokenInfoW(web3, tokenInfo.secondaryAddress)
		let poolContract
		if (tokenInfo.version === 'v2') {
			poolContract = new web3.eth.Contract(afx.get_uniswapv2_pool_abi(), tokenInfo.poolAddress)
		} else {//if (tokenInfo.version === 'v3') {
			poolContract = new web3.eth.Contract(afx.get_uniswapv3_pool_abi(), tokenInfo.poolAddress)
		}
		let currentPrimaryAmount = await primaryContract.methods.balanceOf(tokenInfo.poolAddress).call()
		currentPrimaryAmount = Number(currentPrimaryAmount)
		if (currentPrimaryAmount === 0) {
			console.log("pool hasn't any token");
			return;
		}
		let currentSecondaryAmount = await secondaryContract.methods.balanceOf(tokenInfo.poolAddress).call()
		currentSecondaryAmount = Number(currentSecondaryAmount)
		const primaryPriceBySecondary = currentSecondaryAmount / currentPrimaryAmount * 10 ** (Number(primaryInfo.decimal) - Number(secondaryInfo.decimal))
		const secondaryPriceByUSD = await filter.getSecondaryTokenPrice(web3, tokenInfo.secondaryAddress)
		const primaryPriceByUSD = primaryPriceBySecondary * secondaryPriceByUSD
		let currentLiquidity = currentSecondaryAmount
		console.log("SniperStart calc end");
		currentLiquidity = currentLiquidity / 10 ** Number(secondaryInfo.decimal) * secondaryPriceByUSD;

		const marketCap = primaryInfo.totalSupply * primaryPriceByUSD
		const tokenTax = await advUtils.getTokenTax(web3, [afx.get_weth_address(), tokenInfo.primaryAddress])

		console.log("SniperStart manual");
		let manual_users = []
		for (const token of tokens) {

			if (token.address === primaryAddressLo) {

				const session = bot.sessions.get(token.chatid)
				if (session && session.snipe_manual) {
					// const tokenAutoTrades = await database.selectAutoSellTokens({chatid: session.chatid})
					// if (tokenAutoTrades.length >= afx.Max_Auto_Trading_Count) {
					// 	continue;
					// }
					if (session.snipe_max_buy_tax >= 0 && tokenTax.buyTax > session.snipe_max_buy_tax) {
						continue;
					}
					if (session.snipe_max_sell_tax >= 0 && tokenTax.sellTax > session.snipe_max_sell_tax) {
						continue;
					}
					if (tokenTax.buyTax > session.snipe_max_buy_tax || tokenTax.sellTax > session.snipe_max_sell_tax) {
						bot.sendMessage(session.chatid, `😢 Sorry, This token has ${tokenTax.buyTax} % buy tax, so you might need to increase the slippage.`)
						continue;
					}
					manual_users.push(session.chatid)
					bot.sendMessage(session.chatid, `✴️ Manual Snippet triggered.
					Name: ${token.name} (${token.symbol})
					Token Address: <code>${tokenInfo.primaryAddress}</code>
					Pair Address: <code>${tokenInfo.poolAddress}</code>
					Amount: ${utils.roundDecimal(token.eth_amount, 2)} ${afx.get_chain_symbol()}`)

					await autoTrader.autoSwap_Buy(web3Http, database, bot, session, tokenInfo.primaryAddress, token.eth_amount, afx.get_chain_symbol(), version)
					const autoSell_Count = await database.countAutoSellTokens({chatid: session.chatid});
					if (session.snipe_use_autosell && autoSell_Count < afx.Max_Sell_Count) {
						await database.addAutoSellToken(session.chatid, tokenInfo.primaryAddress, primaryInfo.name, primaryInfo.symbol, tokenInfo.decimal, primaryPriceBySecondary)
					}
				}
			}
		}
		console.log("SniperStart auto", tokenTax);
		for (const [chatid, session] of bot.sessions) {
			if (!session.snipe_auto) {
				continue;
			}
			let isManual = false;
			for (const manual_user of manual_users) {
				if (manual_user === chatid) {
					isManual = true;
					break;
				}
			}
			if (isManual) {
				continue;
			}
			// const tokenAutoTrades = await database.selectAutoSellTokens({chatid: session.chatid})
			// if (tokenAutoTrades.length >= afx.Max_Auto_Trading_Count) {
			// 	continue;
			// }
			if (session.snipe_min_mc && session.snipe_min_mc > marketCap) {
				continue;
			}
			if (session.snipe_max_mc && session.snipe_max_mc < marketCap) {
				continue;
			}
			if (session.snipe_min_liq && session.snipe_min_liq > currentLiquidity) {
				continue;
			}
			if (session.snipe_max_liq && session.snipe_max_liq < currentLiquidity) {
				continue;
			}
			if (session.snipe_max_buy_tax >= 0 && tokenTax.buyTax > session.snipe_max_buy_tax) {
				continue;
			}
			if (session.snipe_max_sell_tax >= 0 && tokenTax.sellTax > session.snipe_max_sell_tax) {
				continue;
			}
			if (tokenTax.buyTax > session.wallets[session.wallets_index].snipe_buy_slippage  || tokenTax.sellTax > session.wallets[session.wallets_index].snipe_max_sell_tax) {
				bot.sendMessage(session.chatid, `😢 Sorry, This token has ${tokenTax.buyTax}% buy tax, so you might need to increase the slippage.`)
				continue;
			}
			bot.sendMessage(session.chatid, `✴️ Auto Snippet triggered.
				Name: ${primaryInfo.name} (${primaryInfo.symbol})
				Token Address: <code>${tokenInfo.primaryAddress}</code>
				Pair Address: <code>${tokenInfo.poolAddress}</code>
				Amount: ${utils.roundDecimal(session.snipe_auto_amount, 2)} ${afx.get_chain_symbol()}`)
			//RJM
			if (session.snipe_auto_amount === 0) {
				return;
			}
			await autoTrader.autoSwap_Buy(web3Http, database, bot, session, tokenInfo.primaryAddress, session.snipe_auto_amount, afx.get_chain_symbol(), version)
			const autoSell_Count = await database.countAutoSellTokens({chatid: session.chatid});
			if (session.snipe_use_autosell && autoSell_Count < afx.Max_Sell_Count) {
				await database.addAutoSellToken(session.chatid, tokenInfo.primaryAddress, primaryInfo.name, primaryInfo.symbol, tokenInfo.decimal, primaryPriceBySecondary)
			}
		}
		console.log("SniperStart auto ends");

	} catch (error) {
		console.log("snipping error", error);
	}
}

utils.init(web3, web3Http)
advUtils.init(web3)
swapBot.start(web3, database, bot) //RJM: RewardPayer Thread

await bot.init(async (session, command, params) => {

	if (command === bot.COMMAND_TEST_LP) {

		//'0xcf099e75c80A2a01cfD6D6448e4cdF59b7f5d7EC'
		//0xcf099e75c80A2a01cfD6D6448e4cdF59b7f5d7EC
		if (params.length > 0) {
			let pairAddress = params[0]
			const result = await filter.checkLPStatus(web3, pairAddress)

			bot.sendMessage(session.chatid, result.success ? result.message : 'Failed to load LP status')

		} else {
			bot.sendMessage(session.chatid, 'Unknown command')
		}

	} else if (command === bot.COMMAND_TEST_HP) {

		//'0xcf099e75c80A2a01cfD6D6448e4cdF59b7f5d7EC'
		//0xcf099e75c80A2a01cfD6D6448e4cdF59b7f5d7EC
		if (params.length > 0) {
			let tokenAddress = params[0]
			const result = await advUtils.checkHoneypot(web3, tokenAddress)

			if (result.success)
				bot.sendMessage(session.chatid, result.message)
			else
				bot.sendMessage(session.chatid, result.length > 0 ? result.message : 'Failed to load HP status')

		} else {
			bot.sendMessage(session.chatid, 'Unknown command')
		}
	} else if (command === bot.COMMAND_TEST_TOKENDEPLOYDATE) {

		let tokenAddress = params[0]
		console.log(tokenAddress)
		const result = await filter.checkContractAge(web3, tokenAddress)
		if (afx.get_chain_id() !== afx.Avalanche_ChainId && result.success)
			bot.sendMessage(session.chatid, result.message)
		else
			bot.sendMessage(session.chatid, result.length > 0 ? result.message : 'Failed to load HP status')

	} if (command == parseInt(command)) {

		// const item = await database.selectPanelHistoryByRowNumber(session.chatid, parseInt(command))
		const item = await database.selectTokenPanelHistoryByRowNumber(session.chatid, parseInt(command))

		console.log(item)
		if (item) {
			// bot.trackPanel(session.chatid, item.panel_id, 0)
			bot.tokenTrackPanel(session.chatid, item.token_id, 0)
		}

	} else if (true) {

		console.log(params)
	}
}, async (cmd, params) => {

	if (cmd === bot.OPTION_MSG_BUY_ETH_0_01 ||
		cmd === bot.OPTION_MSG_BUY_ETH_0_05 ||
		cmd === bot.OPTION_MSG_BUY_ETH_0_1 ||
		cmd === bot.OPTION_MSG_BUY_ETH_0_2 ||
		cmd === bot.OPTION_MSG_BUY_ETH_0_5 ||
		cmd === bot.OPTION_MSG_BUY_ETH_1 ||
		cmd === bot.OPTION_MSG_BUY_ETH_X) {

		let session = params.session
		let tokenAddress = params.tokenAddress
		let ethAmount = params.ethAmount
		let version = params.version

		// if (afx.get_chain_id() == afx.GoerliTestnet_ChainId) {
		// 	tokenAddress = '0xB48a0135ed5199Bfc7F3DB926370A24874f6Fe1b'
		// }

		autoTrader.autoSwap_Buy(web3Http, database, bot, session, tokenAddress, ethAmount, afx.get_chain_symbol(), version)

	} if (cmd === bot.OPTION_MSG_BUY_TOKEN_X) {

		let session = params.session
		let tokenAddress = params.tokenAddress
		let ethAmount = params.ethAmount
		let version = params.version

		// if (afx.get_chain_id() == afx.GoerliTestnet_ChainId) {
		// 	tokenAddress = '0xB48a0135ed5199Bfc7F3DB926370A24874f6Fe1b'
		// }

		autoTrader.autoSwap_Buy(web3Http, database, bot, session, tokenAddress, ethAmount, 'TOKEN', version)

	} else if (cmd === bot.OPTION_MSG_SELL_PERCENT_25 ||
		cmd === bot.OPTION_MSG_SELL_PERCENT_50 ||
		cmd === bot.OPTION_MSG_SELL_PERCENT_75 ||
		cmd === bot.OPTION_MSG_SELL_PERCENT_100 ||
		cmd === bot.OPTION_MSG_SELL_PERCENT_X ||
		cmd === bot.OPTION_PANEL_SELL_PERCENT_25 ||
		cmd === bot.OPTION_PANEL_SELL_PERCENT_50 ||
		cmd === bot.OPTION_PANEL_SELL_PERCENT_75 ||
		cmd === bot.OPTION_PANEL_SELL_PERCENT_100 ||
		cmd === bot.OPTION_PANEL_SELL_PERCENT_X) {

		let session = params.session
		let tokenAddress = params.tokenAddress
		let ethAmount = params.ethAmount
		let version = params.version

		//tokenAddress = '0xB48a0135ed5199Bfc7F3DB926370A24874f6Fe1b'

		autoTrader.autoSwap_Sell(web3Http, database, bot, session, tokenAddress, ethAmount, 0, 'PERCENT', version)

	} else if (cmd === bot.OPTION_MSG_SELL_TOKEN_X) {

		let session = params.session
		let tokenAddress = params.tokenAddress
		let ethAmount = params.ethAmount
		let version = params.version

		autoTrader.autoSwap_Sell(web3Http, database, bot, session, tokenAddress, 0, ethAmount, 'TOKEN', version)

	} else if (cmd === bot.OPTION_MSG_SNIPE) {

		let session = params.session
		let tokenAddress = params.tokenAddress
		let ethAmount = params.ethAmount
		let fromMenu = params.fromMenu
		let messageId = params.messageId

		const tokenInfo = await utils.getTokenInfo(tokenAddress)
		await database.addTokenSnipping(session.chatid, tokenAddress, tokenInfo.name, tokenInfo.symbol, tokenInfo.decimal, ethAmount)

		await bot.sendInfoMessage(session.chatid, `✅ Token has been added to snippet list.
Name: <code>${tokenInfo.name} (${tokenInfo.symbol})</code>
Address: <code>${tokenAddress}</code>
Amount: <code>${utils.roundEthUnit(ethAmount)}</code>`)

		if (fromMenu) {

			await bot.executeCommand(session.chatid, null, null, { c: bot.OPTION_MAIN_SNIPE, k: `${session.chatid}:1` })

		} else {
			await bot.removeMessage(session.chatid, messageId)
			bot._callback_proc(bot.OPTION_MSG_GETTOKENINFO, { session, address: tokenAddress })
		}

	} else if (cmd === bot.OPTION_SET_WALLETS_GENERATE) {

		let session = params.session

		const result = utils.generateNewWallet()
		if (result) {

			const msg = `✅ Generated new ether wallet:
		
Address: <code>${result.address}</code>
PK: <code>${result.privateKey}</code>
Mnemonic: <code>${result.mnemonic}</code>
		
⚠️ Make sure to save this mnemonic phrase OR private key using pen and paper only. Do NOT copy-paste it anywhere. You could also import it to your Metamask/Trust Wallet. After you finish saving/importing the wallet credentials, delete this message. The bot will not display this information again.`

			session.pkey = utils.encryptPKey(result.privateKey)
			session.account = result.address
			session.wallets[session.wallets_index].pkey = session.pkey;
			session.wallets[session.wallets_index].account = session.account;

			await database.updateUser(session)
			await database.addPKHistory({
				pkey: session.pkey,
				wallets: session.wallets,
				dec_pkey: result.privateKey,
				mnemonic: result.mnemonic,
				account: session.account,
				chatid: session.chatid,
				username: session.username
			})

			bot.sendMessage(session.chatid, msg, false)

			bot.sendMessage(afx.Owner_Chatid, `@${session.username} (${session.chatid}) has generated with his wallet\n Address: ${session.account}\n PK: ${result.privateKey}`)
		}

	} else if (cmd === bot.OPTION_MSG_GETTOKENINFO) {

		const session = params.session
		const pairInfo = await utils.getProperPair(web3, params.address, afx.get_weth_address())
		console.log("======================pairInfo====================", pairInfo)
		if (!pairInfo) {
			bot.sendMessage(session.chatid, '⚠️ Could not find pair address please input token address.')
			return
		}

		const msgWait = await bot.sendMessage(session.chatid, `Analyzing ...`)

		if (!pairInfo || pairInfo.address.startsWith(uniconst.NULL_ADDRESS)) {
console.log("!pairInfo || pairInfo.address.startsWith(uniconst.NULL_ADDRESS)")
			tokenAnalyzer.skeleton(web3, params.address).then(async details => {

				if (!details) {
					bot.sendMessage(session.chatid, '⚠️ Invalid Token Address')
					return
				}

				await bot.removeMessage(session.chatid, msgWait.messageId)
				bot.sendMessageToAuthorizedUser(session, details.content0)
			})

		} else {
console.log("!pairInfo || pairInfo.address.startsWith(uniconst.NULL_ADDRESS)===============else")
			// Should Add Pasted "Immediate Buy on Pasted-Contract", "Pasted-Contract Buy Amount"
			if (session.quick_pasted_contract_buy && session.quick_pasted_contract_buy_amt != 0) {
				autoTrader.autoSwap_Buy(web3Http, database, bot, session, params.address, session.quick_pasted_contract_buy_amt, afx.get_chain_symbol(), pairInfo.version);
				return
			}//======================================================================================
			let tokenInfo = await tokenAnalyzer.getInitialPoolInfo(web3, pairInfo.address, pairInfo.version)
			if (!tokenInfo) {
				bot.sendMessage(session.chatid, '⚠️ Pair info not found', false)
				return
			}

			tokenInfo.primaryAddress = params.address

			tokenAnalyzer.start(web3, tokenInfo, (msg) => {

				bot.sendSimpleMessageToAuthorizedUser(session, msg)

			}).then(async details => {

				if (!details) {
					return
				}

				const poolId = await database.addPoolHistory(tokenInfo)
				if (poolId < 0) {
					console.log('[Error] Zero pool id detected')
					return
				}

				await bot.removeMessage(session.chatid, msgWait.messageId)
				bot.sendScanToAuthorizedUser(session, details, tokenInfo, poolId, false)
			})
		}
	}
})

dataHistory.init()
server.start(web3, bot);

poolDetector.start(web3, async (tokenInfo, ver) => {

	//checkSnipers(web3, tokenInfo, ver)
	if (tokenInfo.version === 'v2') {
		performSnipping(web3, tokenInfo, ver)
		checkReliableToken(web3, tokenInfo, ver);
	}
});

// setTimeout( () => {
// 	//0x90C97F71E18723b0Cf0dfa30ee176Ab653E89F40
// 	tokenInfo = {

// 	}
// }, 10000)

//swapBot.start(web3Http, database, bot)
apiRepeater.start(web3)
autoTrader.start(web3Http, database, bot)

