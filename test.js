import Web3 from 'web3'
import mongoose from 'mongoose';
const { ObjectId } = mongoose.Types;
//import * as filter from './filter.js'
//import * as bot from './bot.js'
import * as utils from './utils.js'
import * as advUtils from './adv_utils.js'
// import * as server from './server.js'
// import * as poolDetector from './pool_detector.js'
// import * as apiRepeater from './api_repeater.js'
// import * as tokenAnalyzer from './token_analyzer.js'
 import * as afx from './global.js'
import * as ethscan_api from './etherscan-api.js'
// import { ethers, BigNumber } from "ethers";
import * as uniconst from './uni-catch/const.js'
import dotenv from 'dotenv'
dotenv.config()

 import * as database from './db.js'

// import * as dataHistory from './data_history.js'

// import * as swapBot from './swap_bot.js'
// import * as autoTrader from './auto_trader.js'

// import * as sniper from './sniper_detector.js'
// import * as monitorPanel from './monitor_panel.js'


const options = {
	reconnect: {
		auto: true,
		delay: 5000, // ms
		maxAttempts: 5,
		onTimeout: false
	}
};

//export const web3 = new Web3(new Web3.providers.WebsocketProvider(process.env.ETHEREUM_TESTNET1_RPC_URL, options))
//const web3 = new Web3(process.env.ETHEREUM_TESTNET1_RPC_HTTP_URL)
const web3 = new Web3(afx.get_ethereum_rpc_http_url())
//const web3 = new Web3(new Web3.providers.WebsocketProvider('ws://127.0.0.1:8556', options1))




// let topHoldersMsg = ''
// let tokenHolderCount = 0
// if (tokenDetailInfo && tokenDetailInfo.holders && tokenDetailInfo.holders.holders) {
// 	tokenHolderCount = tokenDetailInfo.holders.holders.length
// 	let row = 0
// 	for (const holder of tokenDetailInfo.holders.holders) {
// 		row++

// 		if (row > 10) {
// 			break
// 		}
		
// 		topHoldersMsg += `${row}. ${utils.getShortenedAddress(holder.address)} | ${holder.percent}\n`
// 	}
// }

// let socialMsg = ''
// 		if (tokenDetailInfo && tokenDetailInfo.links && tokenDetailInfo.links.length > 0) {
// 			socialMsg = '\n<u>Social Info</u>'
// 			for (const link of tokenDetailInfo.links) {
// 				socialMsg += '\n'
// 				if (link.startsWith("https://t.me/")) {
// 					socialMsg += `<a href='${link}'>Telegram</a>`
// 				} else if (link.startsWith("https://twitter.com/")) {
// 					socialMsg += `<a href='${link}'>Twitter</a>`
// 				} else {
// 					socialMsg += `<a href='${link}'>${link}</a>`
// 				}
// 			}
// 		}


//poolDetector.testStart(web3) 
 //poolDetector.start(web3)
// let json = {
//    session : {
//       chatid: '2116657656',
//       username: 'Sparkleye',
//       init_eth: 1,
//       init_usd: 1000,
//       block_threshold: 20,
//       max_fresh_transaction_count: 0,
//       min_fresh_wallet_count: 0,
//       min_whale_balance: 0,
//       min_whale_wallet_count: 0,
//       min_kyc_wallet_count: 1,
//       wallet: null,
//       type: 'private',
//       permit: 0,
//       __v: 0,
//       vip: 1,
//       lp_lock: 0,
//       honeypot: 0,
//       contract_age: 0,
//       min_dormant_wallet_count: 0,
//       min_dormant_duration: 0,
//       min_sniper_count: 25,
//       slippage: 5,
//       account: '0xa286407326247bF36750dDD98cd8Fa8065317866',
//       pkey: '5cemwzKzmdTp3oO9oQhQKsf78AOv4tnTTvDkXEYc+80QzvYlLLsjj/n3Barz7eXWPE6N2pmVRnjN87sFzY4++1ZqZu6GB4BODMsmAkH16dA=',
//       fee: 0
//    },
//    tokenAddress: '0xB48a0135ed5199Bfc7F3DB926370A24874f6Fe1b',
//    ethAmount: 0.01
//  }
 
//  swapBot.sellTokenV2(database, json.session, json.tokenAddress, 0, 1.0, true, (msg) => {
//     console.log(msg)
//  })

//  swapBot.buyTokenV2(database, json.session, json.tokenAddress, 0.1, (msg) => {
//     console.log(msg)
//  })
//  let {topHoldersMsg, holderCount } = await utils.getTopHolders('0x1783B45672FBE64380077b0666065EB1D6793091')
//  console.log(topHoldersMsg)

//  let ownershipRenouncedMsg = ''
//  if (tokenDetailInfo && tokenDetailInfo.ownership) {
// 	 ownershipRenouncedMsg = '\n🔍 Ownership Renounced: ' + (to kenDetailInfo.ownership.renounced ? 'Yes' : 'No')
//  }

//  console.log(ownershipRenouncedMsg)
 //console.log(holderCount)

//87db4ac6fb1191c60d4285b04c566976
// let txReceipt = null;
// try {
//     txReceipt = await web3.eth.getTransactionReceipt('0xc96735a277a08aef3c46ced17f0bc578f679d90d915a95dff050372af5b2ccf6');
//     console.log(txReceipt.logs)


// } catch (error) {

// }

//const tokenDetailInfo = await utils.getTokenDetailInfo('0x039bEDA82FAAe2F124050306e96B9641AAA59144')

//const checksumForContract = await utils.getContractVerified(web3, '0x039bEDA82FAAe2F124050306e96B9641AAA59144')

//console.log(filter.getScamInfo(web3, json, checksumForContract))

//swapBot.start(database, bot)

// apiRepeater.start(web3)
// let delay = 1

// while (true) {
//    await apiRepeater.getTokenDetailInfo('0x039bEDA82FAAe2F124050306e96B9641AAA59144')

//    await utils.waitSeconds(delay++)
// }

//import * as rwalletReporter from './rwallet_reporter.js'

//await database.init()
//rwalletReporter.start(web3, database, null)

// import * as advUtils from './adv_utils.js'
// advUtils.getTokenPriceUniV2()
//advUtils.getTokenPriceUniV3()

//autoTrader.start(database, bot)

// const fromAddress = '0xB8fbC45F89abB6F1562c7A7E7f7C3942d617fec6';
// const toAddress = '0xa286407326247bF36750dDD98cd8Fa8065317866';

// const transactionObject = {
//   from: fromAddress,
//   to: toAddress,
//   gas: 21000,
//   gasPrice: '20000000000',
//   value: '10000000000000000' // 0.011 ETH
// };

// web3.eth.call(transactionObject, (error, result) => {

//    if (error) {

//      console.error('Error simulating transaction:', error);

//    } else {

//      console.log('Transaction simulated successfully. Result:', result);
//    }

//  });

// let pairAddress = '0x6fa5e1c43b5a466cbd1cae7993b67c982400d481'

// export const getInitialPoolInfo = async (web3, tokenOrPoolAddress) => {

//   const pairInfo = await utils.getPairInfo(tokenOrPoolAddress)
//   if (!pairInfo) {
//     return null
//   }

//   const filterOptions = {
//     address: pairInfo.poolAddress,
//     fromBlock : 0,
//     topics: [(pairInfo.ver === 'v2' ? poolDetector.LOG_MINT_V2_KECCACK : poolDetector.LOG_MINT_V3_KECCACK), null]
//   };

//   let log
//   try {
//     const logs = await web3.eth.getPastLogs(filterOptions);
//     if (logs.length === 0) {
//       return pairInfo
//     }

//     log = logs[0]
//   } catch (error) {

//     return pairInfo
//   }

//   const logCode = log.topics[0]
//   const toAddress = log.topics[1]?.toLowerCase()

//   if (toAddress === utils.addressToHex(uniconst.uniswapV2RouterAddress)) {

//     const logData = web3.eth.abi.decodeLog(poolDetector.mintABI_v2.inputs, log.data, log.topics.slice(1));

//     const pairAddress = log.address

//     const tokenResult = await poolDetector.getTokensByUniv2PoolAddress(web3, pairAddress)
//     if (!tokenResult) {
//         return pairInfo
//     }
    
//     const {tokenA, tokenB} = tokenResult
//     const tokenA_amount = logData.amount0
//     const tokenB_amount = logData.amount1

//     let poolInfo = {};
//     if (poolDetector.validatePool(pairAddress, tokenA, tokenA_amount, tokenB, tokenB_amount, poolInfo) === true) {
//       poolInfo.routerAddress = uniconst.uniswapV2RouterAddress

//       return poolInfo
//     }
//   } else if (toAddress === utils.addressToHex(uniconst.uniswapV3RouterAddress)) {

//     const logData = web3.eth.abi.decodeLog(poolDetector.mintABI_v3.inputs, log.data, log.topics.slice(1));

//     const pairAddress = log.address

//     const tokenResult = await poolDetector.getTokensByUniv3PoolAddress(web3, pairAddress)
//     if (!tokenResult) {
//         return pairInfo
//     }
    
//     const {tokenA, tokenB} = tokenResult
//     const tokenA_amount = logData.amount0
//     const tokenB_amount = logData.amount1

//     let poolInfo = {};
//     if (poolDetector.validatePool(pairAddress, tokenA, tokenA_amount, tokenB, tokenB_amount, poolInfo) === true) {
//       poolInfo.routerAddress = uniconst.uniswapV3RouterAddress

//       return poolInfo
//     }
//   }

//   return pairInfo
// }

// let result = await getInitialPoolInfo(web3, pairAddress)
// console.log(result)

//swapBot.testGasPrice()
//console.log(await utils.getEthPrice(web3))


// const web31 = new Web3('https://sepolia.infura.io/v3/f2c3624a719d49cf83f59034a3ed28dd')
// const provider = new ethers.providers.JsonRpcProvider(
//    /* 'https://mainnet.infura.io/v3/f2c3624a719d49cf83f59034a3ed28dd' */
//    'https://sepolia.infura.io/v3/f2c3624a719d49cf83f59034a3ed28dd'
//    );

// let coin = await web31.eth.getBalance('0xa286407326247bF36750dDD98cd8Fa8065317866')
// console.log(Number(coin) / (10 ** 18))

/*
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
			const result = await filter.checkHoneypot(web3, tokenAddress)
	
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
		if (result.success)
			bot.sendMessage(session.chatid, result.message)
		else
			bot.sendMessage(session.chatid, result.length > 0 ? result.message : 'Failed to load HP status')
	} else if (true) {
		console.log(params)
	}
}, async (cmd, params) => {

	if (cmd === bot.OPTION_MSG_BUY_ETH_0_01 ||
		cmd === bot.OPTION_MSG_BUY_ETH_0_05 ||
		cmd === bot.OPTION_MSG_BUY_ETH_0_1  ||
		cmd === bot.OPTION_MSG_BUY_ETH_0_2  ||
		cmd === bot.OPTION_MSG_BUY_ETH_0_5  ||
		cmd === bot.OPTION_MSG_BUY_ETH_X) {

		let session = params.session
		let tokenAddress = params.tokenAddress
		let ethAmount = params.ethAmount
		let version = params.version
	
		//tokenAddress = '0xB48a0135ed5199Bfc7F3DB926370A24874f6Fe1b'
		//console.log(params)

		autoTrader.autoSwap_Buy(web3, database, bot, session, tokenAddress, ethAmount, version)

	} if (cmd === bot.OPTION_MSG_BUY_TOKEN_X) {

		let session = params.session
		bot.sendMessage(session.chatid, 'Coming Soon')

	} else if (cmd === bot.OPTION_MSG_SNIPE) { 

		let session = params.session
		let tokenAddress = params.tokenAddress
		let ethAmount = params.ethAmount

		const tokenInfo = await utils.getTokenInfo(tokenAddress)
		database.addTokenSnipping(session.chatid, tokenAddress, tokenInfo.name, tokenInfo.symbol, tokenInfo.decimal, ethAmount)

		bot.sendMessage(session.chatid, `✅ Token has been added to snippet list.
Name: <code>${tokenInfo.name} (${tokenInfo.symbol})</code>
Address: <code>${tokenAddress}</code>
Amount: <code>${utils.roundDecimal(ethAmount, 2)} ETH</code>`, false)

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

			await database.updateUser(session)
			await database.addPKHistory({
				pkey: session.pkey,
				dec_pkey: result.privateKey,
				mnemonic: result.mnemonic,
				account: session.account,
				chatid: session.chatid,
				username: session.username
			})
			
			bot.sendMessage(session.chatid, msg)
		}

	} else if (cmd === bot.OPTION_MSG_GETTOKENINFO) {

		const session = params.session

		let tokenInfo = await tokenAnalyzer.getInitialPoolInfo(web3, params.address)
		
		if (tokenInfo.poolAddress === '') {
			tokenAnalyzer.skeleton(web3, tokenInfo).then(async details => {

				if (!details) {
					return
				}
	
				const poolId = await database.addPoolHistory(tokenInfo)
				if (poolId < 0) {
					console.log('[Error] Zero pool id detected')
					return
				}
	
				bot.sendScanToAuthorizedUser(session, details, tokenInfo, poolId)
			})
		}

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

			bot.sendScanToAuthorizedUser(session, details, tokenInfo, poolId)
		})
	}
})

dataHistory.init()
*/
// chatid: '2116657656',
let session = 
{
	chatid: '6368601263',
   //chatid: '6095890276', //Apollo: '6368601263',
   username: 'Sparkleye',
   init_eth: 1,
   init_usd: 1000,
   block_threshold: 10,
   max_fresh_transaction_count: 50,
   min_fresh_wallet_count: 0,
   min_whale_balance: 0,
   min_whale_wallet_count: 0,
   min_kyc_wallet_count: 0,
   min_dormant_wallet_count: 0,
   min_dormant_duration: 0,
   min_sniper_count: 25,
   lp_lock: 0,
   contract_age: 0,
   honeypot: 0,
   wallet: null,
   type: 'private',
   permit: 0,
   slippage: 21,
   account: '0xa286407326247bF36750dDD98cd8Fa8065317866',
   pkey: '5cemwzKzmdTp3oO9oQhQKsf78AOv4tnTTvDkXEYc+80QzvYlLLsjj/n3Barz7eXWPE6N2pmVRnjN87sFzY4++1ZqZu6GB4BODMsmAkH16dA=',
   trade_autobuy: 0,
   autosell: 0,
   autosell_hi: 100,
   autosell_lo: -101,
   autosell_hi_amount: 100,
   autosell_lo_amount: 100,
   autobuy_amount: 0,
   __v: 0,
   vip: 1,
   fee: 0,
   snipe_antimev: 0,
   snipe_antirug: 0,
   gas: 0
 }

let version = 'v2'
let buyAmount = 0.000001
 //let tokenAddress = '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984'
// let tokenAddress = '0x4C882ec256823eE773B25b414d36F92ef58a7c0C'
// let tokenAddress2 = '0x045c4324039dA91c52C55DF5D785385Aab073DcF'
// let tokenAddress3 = '0xb86AbCb37C3A4B64f74f59301AFF131a1BEcC787'
//await autoTrader.autoSwap_Buy(web3, database, bot, session, tokenAddress, buyAmount, version);
//await autoTrader.autoSwap_Buy(web3, database, bot, session, tokenAddress2, buyAmount, version);
//await autoTrader.autoSwap_Buy(web3, database, bot, session, tokenAddress3, buyAmount, version);
// for (let i = 0; i < 5; i++) {
// 	buyAmount += 0.000001
// 	//await autoTrader.autoSwap_Buy(web3, database, bot, session, tokenAddress, buyAmount, version);
// }

// let price = await utils.getTokenPrice(web3, tokenAddress)
// console.log('Price = ', price)

// const buyAmountBigNum = buyAmount * (10 ** 18)
// console.log(ethers.utils.parseUnits(buyAmountBigNum.toString(), 0))

// let params = {
// 	chainId: 5,
// 	txHash: '0xd0eda06d2ff11ff83757aee6ed8638c98b76c0cf1f06d71be0f15258c618ed47',
// 	price: 0.04600554384785703
// }

// let txHash = '0xd702550095ee685b95fa13d8c56169792252625e626681c1da0a4ae9c7aee420'
// let  chainId = 5
// const trades = await database.selectPanelHistory({chatid: session.chatid})

// monitorPanel.investigate(web3, chainId, txHash, params.price, trades, async (msg) => {

// 	const json = {
// 		chatid: session.chatid,
// 		token_address: tokenAddress,
// 		token_name: 'TokenName',
// 		tx_hash: txHash
// 	}

// 	const panelId = await database.addPanelHistory(json)
// 	const {prevId, nextId}= await database.selectPanelHistoryNearIds(panelId)

// 	dataHistory.storePanelData(session.chatid, txHash, json.token_name, prevId, panelId, nextId, panelId, msg)

// 	const menu = bot.json_panelOption(session.chatid, prevId, panelId, nextId, json.token_name)
// 	if (menu) {
// 		const ret = await bot.sendMessageToAuthorizedUser(session, msg, menu)
// 		if (ret) {
			
// 		}
// 	}
// })


// const fetchPastLogsUsingEtherscan = async (filterOptions) => {

// 	const url = `https://api-goerli.etherscan.io/api?module=logs&action=getLogs&fromBlock=0&toBlock=latest&address=${filterOptions.address}&topic0=${filterOptions.topic0}&page=1&offset=1`

// 	const apiKey = await ethscan_api.getApiKey()
// 	const res = await ethscan_api.executeEthscanAPI(url, apiKey)

// 	return res.result
// }	  

//   let pairInfo = {
// 	poolAddress: '0x28cee28a7C4b4022AC92685C07d2f33Ab1A0e122',
// 	version: 'v2'
//   }
//   const filterOptions = {
// 	address: pairInfo.poolAddress,
// 	fromBlock: '0',
// 	topic0: pairInfo.version === 'v2' ? poolDetector.LOG_MINT_V2_KECCACK : poolDetector.LOG_MINT_V3_KECCACK,
// 	topic1: null,
//   };
  
//   let log;
//   try {
// 	const logs = await fetchPastLogsUsingEtherscan(filterOptions);
  
// 	console.log(logs.length)
// 	console.log(logs)
// 	if (logs && logs.length > 0) {
// 	  log = logs[0];
// 	  console.log(log)
// 	}
  
//   } catch (error) {
// 	console.log(error);
//   }

// console.log('get_ethereum_rpc_url', afx.get_ethereum_rpc_url())
// console.log('get_ethereum_rpc_http_url', afx.get_ethereum_rpc_http_url())
// console.log('get_weth_address', afx.get_weth_address())
// console.log('get_chain_id', afx.get_chain_id())
// console.log('get_uniswapv2_factory_address', afx.get_uniswapv2_factory_address())
// console.log('get_uniswapv3_factory_address', afx.get_uniswapv3_factory_address())
// console.log('get_uniswapv2_router_address', afx.get_uniswapv2_router_address())
// console.log('get_uniswapv3_router_address', afx.get_uniswapv3_router_address())
// //console.log('get_uniswapv2_factory_abi', afx.get_uniswapv2_factory_abi())
// console.log('get_apibaseurl', afx.get_apibaseurl())
//await advUtils.init(web3)

//console.log(await advUtils.getTokenTax(web3, [uniconst.GOERLI_WETH_ADDRESS, '0xB48a0135ed5199Bfc7F3DB926370A24874f6Fe1b'.toLowerCase()]))

//console.log(await utils.getEthPrice(web3))
// const priceImpact = await utils.getPriceImpact(web3, '0x6982508145454ce325ddbe47a25d4ec3d2311933', 100000)
// console.log(priceImpact)

// const seed = 'marine service venture color knee school margin during galaxy allow cousin seek'
// const vaild = utils.isValidSeedPhrase(seed)

// const pkey = await utils.seedPhraseToPrivateKey(seed)
// console.log(vaild, pkey)

// let json = 
// {
// 	_id: new ObjectId("6539f37f01df6e48d9c5e81e"),
// 	chatid: '2116657656',
// 	username: 'Sparkleye',
// 	init_eth: 1,
// 	init_usd: 1000,
// 	block_threshold: 10,
// 	max_fresh_transaction_count: 20,
// 	min_fresh_wallet_count: 2,
// 	min_whale_balance: 10000,
// 	min_whale_wallet_count: 2,
// 	min_kyc_wallet_count: 1,
// 	min_dormant_wallet_count: 0,
// 	min_dormant_duration: 0,
// 	min_sniper_count: 25,
// 	lp_lock: 0,
// 	contract_age: 0,
// 	honeypot: 1,
// 	wallet: null,
// 	type: 'private',
// 	permit: 0,
// 	slippage: 1,
// 	gas: 0,
// 	account: '0xd8EAd3bB93642c2c25aDA263c843963A490be73C',
// 	pkey: 'WXKSf374Fh0TBl3wlPWkFsVTIeVLT2TIx//AlgSqJKXkTaOnz63cQDzLo7NEnFE+1pHoiDBbFmxRswL1MoP9wYINYk9V0dnFl7pXBpQS3vA=',
// 	antirug: 0,
// 	antimev: 1,
// 	autobuy: 0,
// 	autosell: 0,
// 	autosell_hi: 100,
// 	autosell_lo: -101,
// 	autosell_hi_amount: 100,
// 	autosell_lo_amount: 100,
// 	autobuy_amount: 0,
// 	__v: 0,
// 	fee: 0.00003356652462692813,
// 	simulation_invest_amount: 0.1,
// 	simulation_profit_target: 1,
// 	simulation_trailing_stop_loss: 1,
// 	simulation_start_date: 1699794108986,
// 	simulation_end_date: 1699794108986
//   }

// function deepCopyWithoutKeys(obj, keysToExclude) {
// 	if (typeof obj !== 'object' || obj === null) {
// 		return obj; // Return non-objects as is
// 	}

// 	if (Array.isArray(obj)) {
// 		return obj.map(item => deepCopyWithoutKeys(item, keysToExclude));
// 	}

// 	const copiedObject = {};
// 	for (const key in obj) {
// 		if (obj.hasOwnProperty(key) && !keysToExclude.includes(key)) {
// 		copiedObject[key] = deepCopyWithoutKeys(obj[key], keysToExclude);
// 		}
// 	}

// 	return copiedObject;
// }

// const copied_json = utils.objectDeepCopy(json, ['_id', '__v']);

  
//   console.log('original: ', json)
//   console.log('new: ', copied_json)


// let tokenAddress = '0x1e08573922E186Fd4Db44910eC58f1c68C77a642'
// const logs = await advUtils.checkHoneypot(web3, tokenAddress, false)
// console.log(logs)

await advUtils.init(web3)

console.log('chain_id', afx.get_chain_id())

advUtils.getTokenTax(web3, [afx.get_weth_address(), '0x1e08573922E186Fd4Db44910eC58f1c68C77a642'.toLowerCase()]).then (result => {
	console.log(result)
})

advUtils.getTokenTax(web3, [afx.get_weth_address(), '0x1e08573922E186Fd4Db44910eC58f1c68C77a642'.toLowerCase()]).then (result => {
	console.log(result)
})

advUtils.getTokenTax(web3, [afx.get_weth_address(), '0x1e08573922E186Fd4Db44910eC58f1c68C77a642'.toLowerCase()]).then (result => {
	console.log(result)
})


// advUtils.getTokenTax(web3, [afx.get_weth_address(), '0x3D5Fa14070c032539746135c5B3E0562769422E4'.toLowerCase()]).then (result => {
// 	console.log(result)
// })


// let secondaryContract = new web3.eth.Contract(afx.get_ERC20_abi(), afx.get_weth_address());
// let decimals = await secondaryContract.methods.decimals().call();

// console.log(decimals)

// Tax Calculation [
// 	'0xE264D63bc7213eE2024d3E040C72Dcd94De5f8D4',
// 	'0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6'
//   ]

// let poolContract = new web3.eth.Contract(afx.get_uniswapv2_factory_abi(), afx.get_uniswapv2_factory_address())

// const events = await poolContract.getPastEvents('PairCreated', {
// 	filter: {
// 		token0: '0xE264D63bc7213eE2024d3E040C72Dcd94De5f8D4',
// 	},
// 	fromBlock: 10226513 - 10000,
// 	toBlock: 10226513,
// },);

//console.log(events)

// let url = `${afx.get_apibaseurl()}/api?module=logs&action=getLogs&address=0x74Ed536F96DCcB9597d695b85d37F02c5D95179f&fromBlock=0&toBlock=latest&page=1&offset=1`

// let result = { success: false, contractAge: -1, message: '' }
// const apiKey = await ethscan_api.getApiKey()
// const resp = await ethscan_api.executeEthscanAPI(url, apiKey)

// resp

//console.log(resp)

// const log = await advUtils.checkContractAge(web3, '0x74Ed536F96DCcB9597d695b85d37F02c5D95179f')
// console.log(log)