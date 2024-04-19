import TelegramBot from 'node-telegram-bot-api'

import assert from 'assert';
import dotenv from 'dotenv'
dotenv.config()

import * as database from './db.js'

import * as privateBot from './bot_private.js'
import * as afx from './global.js'

import * as dataHistory from './data_history.js'
import * as monitorPanel from './monitor_panel.js'
import { md5 } from './md5.js'

import * as utils from './utils.js'
import * as simulator from './simulation_call.js'
import { removeAutoSellAllData, removeAutoSellAllDataByParam, removeAutoSellAllDataByTokenId, removeLimitOrderAllDataByParam } from "./auto_trader.js";
  
import { web3Http } from "./index.js";
const token = process.env.BOT_TOKEN
export const bot = new TelegramBot(token,
	{
		polling: true
	})

export const myInfo = await bot.getMe();

export const sessions = new Map()
export const stateMap = new Map()
export const msgMap = new Map()

export const MIN_COMUNITY_TOKEN_AMOUNT = process.env.MIN_COMUNITY_TOKEN_AMOUNT

export const COMMAND_WELCOME = 'start'
export const COMMAND_STARTBOT = 'assassinsgreed'
export const COMMAND_DIRECT = 'direct'
export const COMMAND_DIRECTALL = 'directall'
export const COMMAND_DIRECTNONLOGIN = 'directnon'
export const COMMAND_TEST_LP = 'test_lp'
export const COMMAND_TEST_HP = 'test_hp'
export const COMMAND_TEST_TOKENDEPLOYDATE = 'test_tokendeploydate'
export const COMMAND_MYACCOUNT = 'myaccount'
export const COMMAND_CONNECT = 'connect'
export const COMMAND_QUICK = 'quick'
export const COMMAND_MONITOR = 'monitor'
export const COMMAND_LOGIN = 'login'
export const COMMAND_CANCEL = 'cancel'
export const COMMAND_SENDREWARD = 'sendreward'

export const OPTION_WELCOME = 0
export const OPTION_MAIN_MENU = 1
export const OPTION_QUICK_MENU = 2
export const OPTION_SETTINGS_MENU = 3
export const OPTION_GET_ALL_SETTING = 20


export const OPTION_SET_CONTRACT_AGE_PLUS0_1DAY = 28
export const OPTION_SET_CONTRACT_AGE_PLUS1DAY = 29
export const OPTION_SET_CONTRACT_AGE_PLUS1MONTH = 30
export const OPTION_SET_CONTRACT_AGE_PLUS1YEAR = 31
export const OPTION_SET_CONTRACT_AGE_PLUSNUMBERDAYS = 32
export const OPTION_SET_CONTRACT_AGE_TURN_OFF = 33
export const OPTION_SET_SNIPER_DETECTOR = 40
export const OPTION_SET_SNIPER_DETECTOR_TURN_ON = 41
export const OPTION_SET_SNIPER_DETECTOR_TURN_OFF = 42
export const OPTION_BACK = -1
export const OPTION_CLOSE = -2

export const OPTION_TITLE = 100
export const OPTION_MAIN_SNIPE = 101
export const OPTION_MAIN_SCANNER = 102
export const OPTION_MAIN_TRADE = 103
export const OPTION_MAIN_WALLETS = 104
export const OPTION_TITLE_COPY = 105
export const OPTION_MAIN_MANUAL = 106
export const OPTION_SWAP_BOT = 107
export const OPTION_SIMULATION = 108
export const OPTION_MAIN_REFERRAL = 109

export const OPTION_SET_SNIPE_ANTIRUG = 1110
export const OPTION_SET_SNIPE_ANTIMEV = 1111
export const OPTION_SET_SNIPE_WALLET = 1112
export const OPTION_SET_SNIPE_SLIPPAGE = 1113
export const OPTION_SET_SNIPE_MAX_GAS_PRICE = 1114
export const OPTION_SET_SNIPE_MAX_GAS_LIMIT = 1115
export const OPTION_SET_SNIPE_AUTO = 1116
export const OPTION_SET_SNIPE_GAS_DELTA = 1117
export const OPTION_SET_SNIPE_MAX_MC = 1118
export const OPTION_SET_SNIPE_MIN_LIQ = 1119
export const OPTION_SET_SNIPE_MAX_LIQ = 1120
export const OPTION_SET_SNIPE_MAX_BUY_TAX = 1121
export const OPTION_SET_SNIPE_MAX_SELL_TAX = 1122
export const OPTION_SET_SNIPE_MANUAL = 1123
export const OPTION_SET_SNIPE_USE_AUTOSELL = 1124
export const OPTION_SET_SNIPE_AUTO_AMOUNT = 1125
export const OPTION_SET_SNIPE_MIN_MC = 1126

export const OPTION_SNIPE_WALLET_PANEL = 1130;
export const OPTION_SNIPE_WALLET_CREATE_NEW = 1131;
export const OPTION_SNIPE_WALLET_IMPORT = 1132;
//======================RJM====================
export const OPTION_SNIPE_WALLET_SHOW = 1133;
export const OPTION_SNIPE_EAGLE = 1134;
export const OPTION_WALLET_CONFIG = 1135;
export const OPTION_SNIPE_WHITEPAPER = 1136;

export const OPTION_CONFIG_OVERVIEW = 1139;
export const OPTION_CONFIG_BUY_SLIPPAGE = 1140;
export const OPTION_CONFIG_SELL_SLIPPAGE = 1141;
export const OPTION_CONFIG_BUY_GWEI = 1142;
export const OPTION_CONFIG_SELL_GWEI = 1143;
export const OPTION_CONFIG_MAX_TAX = 1144;
export const OPTION_CONFIG_MIN_TAX = 1145;
export const OPTION_CONFIG_MAX_LIQUIDITY = 1146;
export const OPTION_CONFIG_MIN_LIQUIDITY = 1147;
export const OPTION_CONFIG_WALLET_SETTING = 1148;
export const OPTION_CONFIG_SWITCH_SETTING = 1149;

export const OPTION_SET_LIMIT_ORDER_HI = 1160;
export const OPTION_SET_LIMIT_ORDER_HI_AMOUNT = 1161;
export const OPTION_SET_LIMIT_ORDER_LO = 1162;
export const OPTION_SET_LIMIT_ORDER_LO_AMOUNT = 1163;
export const OPTION_SET_LIMIT_ORDER_ADD = 1164;
export const OPTION_SET_LIMIT_ORDER_REMOVE = 1165;

export const OPTION_SET_LIMIT_ORDER_LO_ENABLE = 1166
export const OPTION_SET_LIMIT_ORDER_LO_DISABLE = 1167 
export const OPTION_SET_LIMIT_ORDER_HI_DISABLE = 1168
export const OPTION_SET_LIMIT_ORDER_HI_ENABLE = 1169
//=============================================
export const OPTION_SET_SNIPE_MANUAL_TOKEN_SHOW = 1150
export const OPTION_SET_SNIPE_MANUAL_TOKEN_REMOVE = 1151
export const OPTION_SET_SNIPE_MANUAL_TOKEN_REMOVEALL = 1152
export const OPTION_SET_SNIPE_MANUAL_TOKEN_ADD = 1153

export const OPTION_SET_SCANNER_INIT_LIQUIDITY = 120
export const OPTION_SET_SCANNER_WHALE_WALLET = 121
export const OPTION_SET_SCANNER_KYC_WALLET = 122
export const OPTION_SET_SCANNER_CONTRACT_AGE = 123
export const OPTION_SET_SCANNER_HONEYPOT = 124
export const OPTION_SET_SCANNER_FRESH_WALLET = 125
export const OPTION_SET_SCANNER_LPLOCK = 126
export const OPTION_SET_SCANNER_LPLOCK_TURN_OFF = 127
export const OPTION_SET_SCANNER_LPLOCK_TURN_ON = 128
export const OPTION_SET_SCANNER_ALL_OFF = 129

export const OPTION_SET_FRESH_WALLET_TURN_ON = 2
export const OPTION_SET_FRESH_WALLET_TURN_OFF = 3
export const OPTION_SET_WHALE_WALLET_TURN_ON = 5
export const OPTION_SET_WHALE_WALLET_TURN_OFF = 6
export const OPTION_SET_KYC_WALLET_TURN_ON = 8
export const OPTION_SET_KYC_WALLET_TURN_OFF = 9
export const OPTION_SET_INIT_LIQUIDITY_ETH = 11
export const OPTION_SET_INIT_LIQUIDITY_USD = 12
export const OPTION_SET_SCANNER_RESET = 19
export const OPTION_SET_HONEYPOT_TURN_OFF = 25
export const OPTION_SET_HONEYPOT_TURN_ON = 26

export const OPTION_SET_TRADE_AUTOBUY = 1200
export const OPTION_SET_TRADE_BUY_AMOUNT = 1201
export const OPTION_SET_TRADE_AUTOSELL = 1202
export const OPTION_SET_TRADE_SELL_HI = 1203
export const OPTION_SET_TRADE_SELL_HI_AMOUNT = 1204
export const OPTION_SET_TRADE_SELL_LO = 1205
export const OPTION_SET_TRADE_SELL_LO_AMOUNT = 1206
export const OPTION_SET_TRADE_RESET = 1207
export const OPTION_SET_TRADE_TOKEN_ADD = 1208
export const OPTION_SET_TRADE_TOKEN_SHOW = 1209
export const OPTION_SET_TRADE_TOKEN_REMOVE = 1210
export const OPTION_SET_TRADE_TOKEN_REMOVEALL = 1211
export const OPTION_SET_SELL_GAS_DELTA = 1212;
//===============RJM==============
export const OPTION_SET_BUY_GAS_DELTA = 1213;

export const OPTION_SET_QUICK_AUTOBUY = 146
export const OPTION_SET_QUICK_AUTOSELL = 147

export const OPTION_SET_WALLETS_CONNECT = 149
export const OPTION_SET_WALLETS_DISCONNECT = 151
export const OPTION_SET_WALLETS_GENERATE = 152
export const OPTION_SET_WALLETS_MULTI = 153
export const OPTION_SET_WALLETS_BALANCE = 154
export const OPTION_SET_WALLETS_ACCOUNT_1 = 155
export const OPTION_SET_WALLETS_ACCOUNT_2 = 156
export const OPTION_SET_WALLETS_ACCOUNT_3 = 157

export const OPTION_MSG_COPY_ADDRESS = 500
export const OPTION_MSG_MORE_INFO = 501
export const OPTION_MSG_BACK_INFO = 502
export const OPTION_MSG_GETTOKENINFO = 503

export const OPTION_MSG_BUY_ETH_0_01 = 510
export const OPTION_MSG_BUY_ETH_0_05 = 511
export const OPTION_MSG_BUY_ETH_0_1 = 512
export const OPTION_MSG_BUY_ETH_0_2 = 513
export const OPTION_MSG_BUY_ETH_0_5 = 514
export const OPTION_MSG_BUY_ETH_1 = 515
export const OPTION_MSG_BUY_ETH_X = 516
export const OPTION_MSG_BUY_TOKEN_X = 517
export const OPTION_MSG_SNIPE = 518
export const OPTION_MSG_SNIPE_REMOVE = 519

export const OPTION_MSG_SELL_PERCENT_25 = 520
export const OPTION_MSG_SELL_PERCENT_50 = 521
export const OPTION_MSG_SELL_PERCENT_75 = 522
export const OPTION_MSG_SELL_PERCENT_100 = 523
export const OPTION_MSG_SELL_PERCENT_X = 524
export const OPTION_MSG_SELL_TOKEN_X = 525

export const OPTION_PANEL_SELL_PERCENT_25 = 530
export const OPTION_PANEL_SELL_PERCENT_50 = 531
export const OPTION_PANEL_SELL_PERCENT_75 = 532
export const OPTION_PANEL_SELL_PERCENT_100 = 533
export const OPTION_PANEL_SELL_PERCENT_X = 534
export const OPTION_PANEL_SELL_TOKEN_X = 535

export const OPTION_SET_PASTED_CONTRACT_BUY = 540
export const OPTION_SET_PASTED_CONTRACT_BUY_AMT = 541

export const OPTION_PANEL_PREV_PANEL = 600
export const OPTION_PANEL_NEXT_PANEL = 601
export const OPTION_PANEL_REFRESH = 602
export const OPTION_PANEL_DELETE = 603
export const OPTION_PANEL_AUTOSELL_SET = 604
export const OPTION_PANEL_AUTOSELL_REMOVE = 605

export const OPTION_SET_SIMULATION_INIT_ETH_AMOUNT = 700
export const OPTION_SET_SIMULATION_PROFIT_TARGET = 701
export const OPTION_SET_SIMULATION_TRAILING_STOP_LOSS = 702
export const OPTION_SET_SIMULATION_START_DATE = 703
export const OPTION_SET_SIMULATION_END_DATE = 704

export const OPTION_SIMULATION_STARTWITHATOKEN = 720
export const OPTION_SIMULATION_START = 721
export const OPTION_SIMULATION_SETTING = 722

export const OPTION_SWAP_BUYTOKEN = 800
export const OPTION_SWAP_SELLTOKEN = 801
export const OPTION_SWAP_ADVANCED = 802
export const OPTION_SWAP_BUY_0_1 = 803
export const OPTION_SWAP_BUY_0_5 = 804
export const OPTION_SWAP_BUY_0_25 = 805
export const OPTION_SWAP_BUY_TOKEN_X = 806
export const OPTION_SWAP_SELL_PERCENT_25 = 807
export const OPTION_SWAP_SELL_PERCENT_50 = 808
export const OPTION_SWAP_SELL_PERCENT_75 = 809
export const OPTION_SWAP_SELL_PERCENT_100 = 810
export const OPTION_SWAP_SELL_PERCENT_X = 811
export const OPTION_SWAP_SELL_TOKEN_X = 812
export const OPTION_SWAP_BUY_BUTTON = 813
export const OPTION_SWAP_SELL_BUTTON = 814
export const OPTION_SWAP_ACCOUNT_1 = 815
export const OPTION_SWAP_ACCOUNT_2 = 816
export const OPTION_SWAP_ACCOUNT_3 = 817

export const OPTION_REFERRAL_WITHDRAW_WALLET = 900

export const STATE_IDLE = 0
export const STATE_WAIT_FRESH_WALLET_MAX_TRANSACTION_COUNT = 101
export const STATE_WAIT_MIN_FRESH_WALLET_COUNT = 102
export const STATE_WAIT_WHALE_WALLET_MIN_BALANCE = 103
export const STATE_WAIT_MIN_WHALE_WALLET_COUNT = 104
export const STATE_WAIT_MIN_KYC_WALLET_COUNT = 105
export const STATE_WAIT_INIT_ETH = 106
export const STATE_WAIT_INIT_USDT_USDC = 107
export const STATE_WAIT_MIN_SNIPER_COUNT = 108
export const STATE_WAIT_MIN_CONTRACT_AGE = 109

export const STATE_WAIT_SET_SCANNER_RESET = 150
export const STATE_WAIT_SET_SCANNER_ALL_OFF = 151

export const STATE_WAIT_SET_PERCENT_X_SELL = 160
export const STATE_WAIT_SET_TOKEN_X_SELL = 161

export const STATE_WAIT_SET_ETH_X_BUY = 162
export const STATE_WAIT_SET_TOKEN_X_BUY = 163

export const STATE_WAIT_SET_TRADE_SELL_LO_AMOUNT = 200
export const STATE_WAIT_SET_TRADE_SELL_HI_AMOUNT = 201
export const STATE_WAIT_SET_TRADE_SELL_LO = 202
export const STATE_WAIT_SET_TRADE_SELL_HI = 203
export const STATE_WAIT_SET_TRADE_BUY_AMOUNT = 204
export const STATE_WAIT_SET_SNIPE_SELL_GAS_DELTA = 205;
//===========================RJM=========================
export const STATE_WAIT_SET_SNIPE_BUY_GAS_DELTA = 208;

export const STATE_WAIT_SET_TRADE_RESET = 206
export const STATE_WAIT_ADD_AUTOSELLTOKEN = 207

export const STATE_WAIT_SET_WALLETS_PRIVATEKEY = 300

export const STATE_WAIT_SET_LIMIT_ORDER_LO_AMOUNT = 301;
export const STATE_WAIT_SET_LIMIT_ORDER_HI_AMOUNT = 302;
export const STATE_WAIT_SET_LIMIT_ORDER_LO = 303;
export const STATE_WAIT_SET_LIMIT_ORDER_HI = 304;

export const STATE_WAIT_SET_PASTED_CONTRACT_BUY_AMT = 305;

export const STATE_WAIT_SET_SNIPE_SLIPPAGE = 400
export const STATE_WAIT_SET_SNIPE = 401
export const STATE_WAIT_SET_SNIPE_GAS_DELTA = 402
export const STATE_WAIT_ADD_SNIPING_TOKEN = 403
export const STATE_WAIT_SET_SNIPE_MAX_GAS_PRICE = 404
export const STATE_WAIT_SET_SNIPE_MAX_GAS_LIMIT = 405
export const STATE_WAIT_SET_SNIPE_AUTO_AMOUNT = 406
export const STATE_WAIT_SET_SNIPE_MAX_MC = 407
export const STATE_WAIT_SET_SNIPE_MIN_LIQ = 408
export const STATE_WAIT_SET_SNIPE_MAX_LIQ = 409
export const STATE_WAIT_SET_SNIPE_MAX_BUY_TAX = 410
export const STATE_WAIT_SET_SNIPE_MAX_SELL_TAX = 411
export const STATE_WAIT_SET_SNIPE_MIN_MC = 412
export const STATE_WAIT_SET_SNIPE_BUY_SLIPPAGE = 413;
export const STATE_WAIT_SET_SNIPE_SELL_SLIPPAGE = 414;

// export const STATE_WAIT_SET_SIMULATION_TOKEN = 30

export const STATE_WAIT_SIMULATION_SET_ETH = 706
export const STATE_WAIT_SIMULATION_SET_TRAILING_STOP_LOSS = 707
export const STATE_WAIT_SIMULATION_SET_PROFIT_TARGET = 708
export const STATE_WAIT_SIMULATION_START_DATE = 709
export const STATE_WAIT_SIMULATION_END_DATE = 710
export const STATE_WAIT_SIMULATION_TOKEN_ADDRESS = 711

export const STATE_WAIT_SWAP_BUY = 712
export const STATE_WAIT_SWAP_BUY_X = 713
export const STATE_WAIT_SWAP_SELL = 714
export const STATE_WAIT_SWAP_SELL_X = 715

export const STATE_WAIT_SET_REFERRAL_WITHDRAW_WALLET = 750

export const stateMap_setFocus = (chatid, state, data = {}) => {

	let item = stateMap.get(chatid)
	if (!item) {
		item = stateMap_init(chatid)
	}

	item.focus = { state, data }
	// stateMap.set(chatid, item)
}

// export const stateMap_setMessage = (chatid, messageItem) => {

// 	let item = stateMap.get(chatid)
// 	if (!item) {
// 		item = {
// 			message : {}
// 		}
// 	}

// 	item.message = messageItem

// 	stateMap.set(chatid, item)
// }

export const stateMap_init = (chatid) => {

	let item = {
		focus: { state: STATE_IDLE, data: { sessionId: chatid } },
		message: new Map()
	}

	stateMap.set(chatid, item)

	return item
}

export const stateMap_setMessage_Id = (chatid, messageType, messageId) => {

	let item = stateMap.get(chatid)
	if (!item) {
		item = stateMap_init(chatid)
	}

	item.message.set(`t${messageType}`, messageId)
	//stateMap.set(chatid, item)
}

export const stateMap_getFocus = (chatid) => {
	const item = stateMap.get(chatid)
	if (item) {
		let focusItem = item.focus
		return focusItem
	}

	return null
}

export const stateMap_getMessage = (chatid) => {
	const item = stateMap.get(chatid)
	if (item) {
		let messageItem = item.message
		return messageItem
	}

	return null
}

export const stateMap_getMessage_Id = (chatid, messageType) => {
	const messageItem = stateMap_getMessage(chatid)
	if (messageItem) {

		return messageItem.get(`t${messageType}`)
	}

	return null
}

export const stateMap_get = (chatid) => {
	return stateMap.get(chatid)
}

export const stateMap_remove = (chatid) => {
	stateMap.delete(chatid)
}

export const stateMap_clear = () => {
	stateMap.clear()
}

const json_buttonItem = (key, cmd, text) => {
	return {
		text: text,
		callback_data: JSON.stringify({ k: key, c: cmd }),
	}
}

const json_inline_buttonItem = (text, web) => {
	return {
		text: text,
		web_app: web
	}
}

// /${COMMAND_CONNECT} - Connect your wallet to the account
export const getWelcomeMessage = () => {
  const communityTokenAmount = Number(MIN_COMUNITY_TOKEN_AMOUNT);
  const WELCOME_MESSAGE = `This is the official <b>${process.env.BOT_TITLE}</b> Bot. 
Here, you can easily snipe, buy and sell your favourite tokens, create your own automated trading strategy and many more to come! Type /assassinsgreed to summon the panel.

By proceeing to use the bot, you confirm that you have read and agreed to our Terms of Services.`; // (https://assassinsgreed.com/).

  // To ensure you're fully equipped to use the bot and up-to-date with its latest developments, please join and regularly check these channels:

  // @AssassinsGreedUpdates
  // @AssassinsGreedBotsHub
  // @AssassinsBots (This link lead to the main chat portal)

  // The bot is available for free use, with only a 1% fee applied to purchases and sales.

  // Be sure to go through the manual for proper understanding. The @AssassinsGreedUpdates channel is your go-to for all recent updates and new features.

  // Remember to follow our Twitter and YouTube.

  // By using the bot, you confirm that you have read and consented to our Terms of Service.

  // Type /assassinsgreed to begin.

  // The premium suite of utilities that every crypto investor needs!

  // ❗ Important:
  // 🔹 Using this bot requires ${utils.roundDecimal(communityTokenAmount, 0)} $${process.env.COMMUNITY_TOKEN_SYMBOL} tokens.
  // 🔹 In order to use this bot, you need to create a Telegram username if you haven't already.`

  return WELCOME_MESSAGE;
};

export const getMainMenuMessage = () => {

	const MESSAGE = `${afx.get_chain_id() != afx.EthereumMainnet_ChainId ? 'CHAIN MODE:' + afx.get_chain_id() + '\n' : ''}🎯 ${process.env.BOT_TITLE} Sniper Bot

	${process.env.BOT_TITLE} is the ultimate sniper bot. Allowing you to snipe token launches, track profits & tailor your automated trading strategy.`

	return MESSAGE;
}

const getManualMessage = () => {
  return `💎${process.env.BOT_TITLE} Bot
└ Automated Trading System (The AutoBuy)
└ Sniper/Buy Bot 
└ On-Chain Alpha Scanner

™️ Automated Trading System 
Introducing our Automatic Trading System, a powerful fusion of ${process.env.BOT_TITLE} and On-Chain Alpha Scanner. As soon as a potential ${process.env.BOT_TITLE} project is detected, the autosniper executes auto buy and sell orders based on your pre-configured settings , enabling you to generate passive profits effortlessly.

🔫 Sniper Bot
Experience the unmatched prowess of ${process.env.BOT_TITLE}, a high-speed sniper bot fueled by cutting-edge technology. This powerful bot operates on the basis of the bribe feature, enabling it to deftly snipe new launches and existing projects with utmost precision.
Seamlessly integrated with the Automated Trading System, ${process.env.BOT_TITLE} goes beyond the ordinary, allowing traders to set their ${afx.get_chain_symbol()} auto buy amount and profit percentage take.
This vital functionality aligns with the On-Chain Scanner's ${process.env.BOT_TITLE} calls, empowering users to capitalize on lucrative opportunities and make informed trading decisions. 

🔎 On-Chain Alpha Scanner 
Introducing the On-Chain Scanner, a crucial component of the Agreed Labs suite within the Automated Trading System. This indispensable tool performs comprehensive blockchain project scans, meticulously seeking early-stage projects with significant growth potential, ${process.env.BOT_TITLE} wallets, whales wallets and deployer wallet.
Customizable to traders' preferences, the scanner offers tailored ${process.env.BOT_TITLE} calls that align precisely with their trading objectives. Moreover, traders have the flexibility to enable or disable the connection with the ${process.env.BOT_TITLE} system, ensuring complete control over their trading strategies.`;
};

export const getQuickSetting = async (session) => {

	let loginStat = ''
	if (afx.FREE_TO_USE) {
		loginStat = `<i>This bot is FREE TO USE for anyone</i>`
	} else if (session.wallet) {

		if (utils.web3Inst) {
			let communityTokenBalance = await utils.getTokenBalanceFromWallet(utils.web3Inst, session.wallet, process.env.COMUNITY_TOKEN);
			loginStat = `✅ <i>You are currently logged in and holding ${utils.roundDecimal(communityTokenBalance, 3)} tokens!\nThanks for the contribution🤩🤩🤩</i>`
		} else {
			loginStat = `<i>You are currently logged in using the wallet</i> <code>${session.wallet}</code>`
		}

	} else if (session.vip === 1) {
		loginStat = `<i>You are logged in as VIP member</i>`

	} else {
		loginStat = `<i>You are not logged in</i>`
	}
  const info = await utils.getGasTracker(utils.web3Inst);
	const SETTING_MESSAGE = `Here are the bot settings for the @${session.username}
Immediate Buy Enabled: ${utils.getConfigString_Checked(session.quick_pasted_contract_buy)}
Immediate Buy Amount: ${(session.quick_pasted_contract_buy_amt)}
Buy Slippage: ${utils.getConfigString_Default(session.wallets[session.wallets_index].snipe_buy_slippage, defaultConfig.snipe_buy_slippage, "%")}
Sell Slippage: ${utils.getConfigString_Default(session.wallets[session.wallets_index].snipe_sell_slippage, defaultConfig.snipe_sell_slippage, "%")}
Buy Gas Price: ${utils.getConfigString_Default(session.wallets[session.wallets_index].snipe_buy_gas_delta, defaultConfig.snipe_buy_gas_delta, "GWEI", utils.roundDecimal(info.gasPrice, 2) + " + ")}
Sell Gas Price: ${utils.getConfigString_Default(session.wallets[session.wallets_index].snipe_sell_gas_delta, defaultConfig.snipe_sell_gas_delta, "GWEI", utils.roundDecimal(info.gasPrice, 2) + " + ")}
// Anti-Mev: ${utils.getConfigString_Checked(session.snipe_antimev)}
Auto-Snipe Enabled: ${utils.getConfigString_Checked(session.snipe_auto)}
Auto-Buy Enabled: ${utils.getConfigString_Checked(session.trade_autobuy)}
Auto-Sell Enabled: ${utils.getConfigString_Checked(session.trade_autosell)}

${loginStat}`;

	return SETTING_MESSAGE
  // ${await getWalletOptionMsg(session.chatid, false)}
	// ${await getSnipeOptionMsg(session.chatid, false)}
	// ${await getTradeOptionMsg(session.chatid, false)}
	// ${await getScannerOptionMsg(session.chatid, false)}
	// ${await getSimulationOptionMsg(session.chatid, false)}
}

export const getWalletOptionMsg = async (sessionId, detailView = true) => {

	assert(sessionId)
	const session = sessions.get(sessionId)
	if (!session) {
		return '*'
	}
	const info = await utils.getGasTracker(utils.web3Inst)

  	const tempWallet = {
		account: null,
		pkey: null,
		snipe_buy_slippage: defaultConfig.snipe_buy_slippage,
		snipe_sell_slippage: defaultConfig.snipe_sell_slippage,
		snipe_max_gas_price: defaultConfig.snipe_max_gas_price,
		snipe_max_gas_limit: defaultConfig.snipe_max_gas_limit,
		snipe_buy_gas_delta: defaultConfig.snipe_buy_gas_delta,
		snipe_sell_gas_delta: defaultConfig.snipe_sell_gas_delta,
	};
	const wallet1 = {...tempWallet};
	wallet1.pkey = session.pkey;
	wallet1.account = session.account;

	if (session.wallets === undefined) {
		session.wallets = [wallet1, {...tempWallet}, {...tempWallet}];
		session.wallets_index = 0;
	}
	//session.wallets
	let wallet_msg = ''
	let index = 0;
	for (const wallet of session.wallets) {
		const account = wallet.account ? wallet.account : 'Not Set'
		let ethBalance
		if (wallet.account) {
			ethBalance = utils.roundEthUnit(await utils.getTokenBalanceFromWallet(utils.web3Inst, wallet.account, 0))
		} else {
			ethBalance = '-'
		}
		const check = index === session.wallets_index ? 1 : 0;
		wallet_msg += `\n▰ Account ${index + 1}▰ ${utils.getConfigWallet_Checked(check)}
	Address: <code>${account}</code>
	Balance: ${ethBalance}
		`
		index++;
	}
	let message = `
⬩Gas: <code>${utils.roundDecimal(info.gasPrice, 2)} GWEI</code> ⬩Block: <code>${info.blockNumber}</code> ⬩${afx.get_chain_symbol()}: <code>$${utils.roundDecimal(info.ethPrice, 0)}</code>

	⬇️ Your Wallet
	${wallet_msg}`
	return message
}

export const getSnipeOptionMsg = async (sessionId, detailView = true) => {

	assert(sessionId)

	const session = sessions.get(sessionId)
	if (!session) {
		return '*'
	}

	const info = await utils.getGasTracker(utils.web3Inst)
	const wallet = session.account ? session.account : 'Not Set'
	let ethBalance
	if (session.account) {
		ethBalance = utils.roundEthUnit(await utils.getTokenBalanceFromWallet(utils.web3Inst, session.account, 0))
	} else {
		ethBalance = '-'
	}

	const snipingCount = await database.countTokenSnipping({ chatid: session.chatid })

	// Multi-Wallet: ${utils.getConfigString_Checked(session.multi_wallet)}
	const balanceInfo = detailView ? `
	Balance: ${ethBalance}
	Wallet: ${wallet}
	Chain: ${afx.get_chain_symbol()}\n` : ''

  const sellInfo = detailView ? 
  `\n<i>Sell Gas Price: ${utils.getConfigString_Default(session.trade_sell_gas_delta, defaultConfig.trade_sell_gas_delta, "GWEI", utils.roundDecimal(info.gasPrice, 2) + " + ")}
	Auto Sell (high): ${utils.getConfigString_Default(session.trade_autosell_hi, defaultConfig.trade_autosell_hi, "%", session.trade_autosell_hi >= 0 ? "+" : "")}
	Sell Amount (high): ${utils.getConfigString_Default(session.trade_autosell_hi_amount, defaultConfig.trade_autosell_hi_amount, "%")}
	Auto Sell (low): ${utils.getConfigString_Default(session.trade_autosell_lo, defaultConfig.trade_autosell_lo, "%", session.trade_autosell_lo >= 0 ? "+" : "")}
	Sell Amount (low):  ${utils.getConfigString_Default(session.trade_autosell_lo_amount, defaultConfig.trade_autosell_lo_amount, "%")}</i>`
  : "";

  const MESSAGE = `
	⬇️ Snipe Options
	${balanceInfo}
	📌 Auto Snipe
	Auto-Snipe Enabled: ${utils.getConfigString_Checked(session.snipe_auto)}
	Buy Token Amount: ${utils.getConfigString_Default(session.snipe_auto_amount, defaultConfig.snipe_auto_amount, afx.get_chain_symbol())}
	Max MC: ${utils.getConfigString_Text('Disabled', session.snipe_max_mc, 0, 'USD')}
	Min MC: ${utils.getConfigString_Text('Disabled', session.snipe_min_mc, 0, 'USD')}
	Min Liquidity: ${utils.getConfigString_Text('Disabled', session.snipe_min_liq, 0, 'USD')}
	Max Liquidity: ${utils.getConfigString_Text('Disabled', session.snipe_max_liq, 0, 'USD')}
	Max Buy Tax: ${utils.getConfigString_Text('Disabled', session.snipe_max_buy_tax, -1, '%')}
	Max Sell Tax: ${utils.getConfigString_Text('Disabled', session.snipe_max_sell_tax, -1, '%')}
	
	📌 Manual Snipe
	Manual-Snipe Enabled: ${utils.getConfigString_Checked(session.snipe_manual)}
	Tokens in Sniping List: ${snipingCount}
	
	📌 Sell
	Use Auto-Sell: ${utils.getConfigString_Checked(session.snipe_use_autosell)}`; //${sellInfo}`

	return MESSAGE

  // 📍 General
  // Anti-MEV: ${utils.getConfigString_Checked(session.snipe_antimev)}
  // Slippage: ${utils.getConfigString_Default(session.snipe_slippage, defaultConfig.snipe_slippage, '%')}
  // Max Gas Price: ${utils.getConfigString_Text('Auto', session.snipe_max_gas_price, 0, 'GWEI')}
  // Max Gas Limit: ${utils.getConfigString_Text('Auto', session.snipe_max_gas_limit, 0)}

  // Buy Gas Price: ${utils.getConfigString_Default(session.snipe_gas_delta, defaultConfig.snipe_gas_delta, 'GWEI', utils.roundDecimal(info.gasPrice, 2) + ' + ')}
};
//=============================RJM========================================
export const getConfigOptionMsg = async (sessionId) => {
  assert(sessionId);

  const session = sessions.get(sessionId);
  if (!session) {
    return "*";
  }
  const strConfigMsg = `
⚙ Config
Wallet Name: Account ${session.wallets_index + 1}
Wallet Address: ${session.account}
	`;
  return strConfigMsg;
};

export const getSwitchSettingMsg = async (sessionId) => {
  assert(sessionId);

  const session = sessions.get(sessionId);
  if (!session) {
    return "*";
  }

  const MESSAGE = `
⚪ Switch

🐷 Activate these settings will set them as the standard for all your snipes.

📖 Info about Switch settings(whitepaper link here)
	`;
  return MESSAGE;
};

export const getConfigOverviewMsg = async (sessionId) => {
  assert(sessionId);

  const session = sessions.get(sessionId);
  if (!session) {
    return "*";
  }

  const info = await utils.getGasTracker(utils.web3Inst);
  const MESSAGE = `
⚙ Config Overview

Wallet Address: ${session.account}
Buy Slippage: ${utils.getConfigString_Default(session.wallets[session.wallets_index].snipe_buy_slippage, defaultConfig.snipe_buy_slippage, "%")}
Sell Slippage: ${utils.getConfigString_Default(session.wallets[session.wallets_index].snipe_sell_slippage, defaultConfig.snipe_sell_slippage, "%")}
Max Gas Limit: ${utils.getConfigString_Text("Auto", session.wallets[session.wallets_index].snipe_max_gas_limit, 0)}
Max Gas Price: ${utils.getConfigString_Text("Auto", session.wallets[session.wallets_index].snipe_max_gas_price, 0, "GWEI")}
Buy Gas Price: ${utils.getConfigString_Default(session.wallets[session.wallets_index].snipe_buy_gas_delta, defaultConfig.snipe_buy_gas_delta, "GWEI", utils.roundDecimal(info.gasPrice, 2) + " + ")}
Sell Gas Price: ${utils.getConfigString_Default(session.wallets[session.wallets_index].snipe_sell_gas_delta, defaultConfig.snipe_sell_gas_delta, "GWEI", utils.roundDecimal(info.gasPrice, 2) + " + ")}

📌 Auto Snipe
Buy Token Amount: ${utils.getConfigString_Default(session.snipe_auto_amount, defaultConfig.snipe_auto_amount, afx.get_chain_symbol()  )}
Max MC: ${utils.getConfigString_Text("Disabled", session.snipe_max_mc, 0, "USD")}
Min MC: ${utils.getConfigString_Text("Disabled", session.snipe_min_mc, 0, "USD")}
Min Liquidity: ${utils.getConfigString_Text("Disabled", session.snipe_min_liq, 0, "USD")}
Max Liquidity: ${utils.getConfigString_Text("Disabled", session.snipe_max_liq, 0, "USD")}
Max Buy Tax: ${utils.getConfigString_Text("Disabled", session.snipe_max_buy_tax, -1, "%")}
Max Sell Tax: ${utils.getConfigString_Text("Disabled", session.snipe_max_sell_tax, -1, "%")}

📌 Sell
<i>Auto Sell (high): ${utils.getConfigString_Default(session.trade_autosell_hi, defaultConfig.trade_autosell_hi, "%", session.trade_autosell_hi >= 0 ? "+" : "")}
Sell Amount (high): ${utils.getConfigString_Default(session.trade_autosell_hi_amount, defaultConfig.trade_autosell_hi_amount, "%")}
Auto Sell (low): ${utils.getConfigString_Default(session.trade_autosell_lo, defaultConfig.trade_autosell_lo, "%", session.trade_autosell_lo >= 0 ? "+" : "")}
Sell Amount (low):  ${utils.getConfigString_Default(session.trade_autosell_lo_amount, defaultConfig.trade_autosell_lo_amount, "%")}</i>

	`;
  return MESSAGE;

  // Buy Gas Delta: ${utils.getConfigString_Default(session.wallets[session.wallets_index].snipe_buy_gas_delta, defaultConfig.snipe_buy_gas_delta, 'GWEI')}
  // Sell Gas Delta: ${utils.getConfigString_Default(session.wallets[session.wallets_index].snipe_sell_gas_delta, defaultConfig.snipe_sell_gas_delta, 'GWEI')}
};

//===========================================================
//==========================RJM==============================
const json_setSnipeOption1 = async (sessionId) => {
  const session = sessions.get(sessionId);

  let json = [];
  if (session) {
    json = [
      [
        json_buttonItem(sessionId, OPTION_SNIPE_WALLET_SHOW, `Wallets`),
        json_buttonItem(sessionId, OPTION_SNIPE_EAGLE, `Eagle Vision Mode`),
      ],
      [
        json_buttonItem(sessionId, OPTION_WALLET_CONFIG, `Config`),
        json_buttonItem(sessionId, OPTION_SNIPE_WHITEPAPER, `Whitepaper`),
      ],
    ];
  }
  return { title: `⬇️ Snipe Options`, options: json };
};

export const json_setWalletConfig = async (sessionId) => {
  const session = sessions.get(sessionId);

  let json = [];
  if (session) {
    json = [
      [
        json_buttonItem(`${sessionId}:1`, OPTION_CONFIG_BUY_SLIPPAGE, `Buy Slippage`),
        json_buttonItem(`${sessionId}:1`, OPTION_CONFIG_SELL_SLIPPAGE, `Sell Slippage`),
      ],
      [
        json_buttonItem(sessionId, OPTION_SET_SNIPE_MAX_GAS_PRICE, `Max Gas Price`),
        // json_buttonItem(sessionId, OPTION_SET_SNIPE_SLIPPAGE, 'Slippage'),
        json_buttonItem(sessionId, OPTION_SET_SNIPE_MAX_GAS_LIMIT, `Max Gas Limit`),
      ],
      [
        json_buttonItem(`${sessionId}:1`, OPTION_SET_BUY_GAS_DELTA, `Buy Gas Delta`),
        json_buttonItem(`${sessionId}:1`, OPTION_SET_SELL_GAS_DELTA, `Sell Gas Delta`),
      ],
      // [
      // 	json_buttonItem(sessionId, OPTION_SET_SNIPE_MAX_BUY_TAX, `Max Buy Tax`),
      // 	json_buttonItem(sessionId, OPTION_CONFIG_MIN_TAX, `Min Buy Tax`)
      // ],
      // [
      // 	json_buttonItem(sessionId, OPTION_CONFIG_MAX_LIQUIDITY, `Max Liquidity`),
      // 	json_buttonItem(sessionId, OPTION_CONFIG_MIN_LIQUIDITY, `Min Liquidity`)
      // ],
      [
        json_buttonItem(sessionId, OPTION_MAIN_WALLETS, `⚙ Wallet Settings`),
        // json_buttonItem(sessionId, OPTION_CONFIG_SWITCH_SETTING, `Switch Settings`)
      ],
      [json_buttonItem(sessionId, OPTION_CONFIG_OVERVIEW, `Config Overview`)],
      [json_buttonItem(sessionId, OPTION_CLOSE, `✖️ Close`)],
    ];
  }

  return { title: `⚙ Config`, options: json };
};

export const json_setWallet1 = (sessionId) => {
  const session = sessions.get(sessionId);
  if (!session) {
    return null;
  }

  let json = [];
  const check_1 = session.wallets_index === 0 ? 1 : 0;
  const check_2 = session.wallets_index === 1 ? 1 : 0;
  const check_3 = session.wallets_index === 2 ? 1 : 0;

  json.push([
    json_buttonItem(sessionId, OPTION_TITLE, `🎯 ${process.env.BOT_TITLE}`),
  ]);
  json.push([
    json_buttonItem(sessionId,OPTION_SET_WALLETS_ACCOUNT_1, `${utils.getConfigWallet_Checked(check_1)} Account 1`),
    json_buttonItem(sessionId, OPTION_SET_WALLETS_ACCOUNT_2, `${utils.getConfigWallet_Checked(check_2)} Account 2`),
    json_buttonItem(sessionId, OPTION_SET_WALLETS_ACCOUNT_3, `${utils.getConfigWallet_Checked(check_3)} Account 3`),
  ]);
  json.push([json_buttonItem(sessionId, OPTION_CLOSE, "✖️ Close")]);

  return { title: "⬇️ Wallets", options: json };
};

export const json_setSwitchSetting = (sessionId) => {
  const session = sessions.get(sessionId);
  if (!session) {
    return "*";
  }

  let json = [];
  json = [
    [json_buttonItem(sessionId, OPTION_SET_SNIPE_ANTIRUG, `❌ Anti Rug`)],
    [
      json_buttonItem(sessionId, OPTION_SET_SNIPE_ANTIRUG, `❌ Transfer on Blacklist`),
    ],
    [
      json_buttonItem(sessionId, OPTION_SET_SNIPE_ANTIRUG, `❌ First Bundle or Fail`),
    ],
    [
      json_buttonItem(sessionId, OPTION_SET_SNIPE_ANTIRUG, `❌ MaxTx or Revert`),
    ],
    [
      json_buttonItem(sessionId, OPTION_SET_SNIPE_ANTIRUG, `◀ Return`),
      json_buttonItem(sessionId, OPTION_CLOSE, `✖️ Close`),
    ],
  ];

  return { title: "Swith settings", options: json };
};

export const json_setConfigOverview = (sessionId) => {
  const session = sessions.get(sessionId);
  if (!session) {
    return "*";
  }

  let json = [];
  json = [[json_buttonItem(sessionId, OPTION_CLOSE, `✖️ Close`)]];

  return { title: "Config Overview", options: json };
};
//=============================================================

export const getTradeOptionMsg = async (sessionId, detailView = true) => {

	assert(sessionId)

	const session = sessions.get(sessionId)
	if (!session) {
		console.log(sessionId)
		return '*'
	}

	const info = await utils.getGasTracker(utils.web3Inst)
	const wallet = session.account ? session.account : 'Not Set'
	let ethBalance
	if (session.account) {
		ethBalance = utils.roundEthUnit(await utils.getTokenBalanceFromWallet(utils.web3Inst, session.account, 0))
	} else {
		ethBalance = '-'
	}

	const snipingCount = await database.countAutoSellTokens({ chatid: session.chatid })

	const balanceInfo = detailView ? `
	Balance: ${ethBalance}
	Wallet: ${wallet}
	Chain: ${afx.get_chain_symbol()}\n` : ''

  const MESSAGE = `
	⬇️ Trade Options
	${balanceInfo}		
	📍 General
	Buy Gas Price: ${utils.getConfigString_Default(session.trade_sell_gas_delta, defaultConfig.trade_sell_gas_delta, 'GWEI', utils.roundDecimal(info.gasPrice, 2) + ' + ')}
	
	📌 Auto-Buy
	Auto-Buy Enabled: ${utils.getConfigString_Checked(session.trade_autobuy)}
	Buy Token Amount: ${utils.getConfigString_Text('Not Set', session.trade_autobuy_amount, defaultConfig.trade_autobuy_amount, afx.get_chain_symbol())}
	
	📌 Auto-Sell
	Auto-Sell Enabled: ${utils.getConfigString_Checked(session.trade_autosell)}
	Tokens in Auto-Sell List: ${snipingCount}
	
	📌 Sell
	Sell Gas Price: ${utils.getConfigString_Default(session.trade_sell_gas_delta, defaultConfig.trade_sell_gas_delta, 'GWEI', utils.roundDecimal(info.gasPrice, 2) + ' + ')}
	Auto Sell (high): ${utils.getConfigString_Default(session.trade_autosell_hi, defaultConfig.trade_autosell_hi, '%', (session.trade_autosell_hi >= 0 ? '+' : ''))}
	Sell Amount (high): ${utils.getConfigString_Default(session.trade_autosell_hi_amount, defaultConfig.trade_autosell_hi_amount, '%')}
	Auto Sell (low): ${utils.getConfigString_Default(session.trade_autosell_lo, defaultConfig.trade_autosell_lo, '%', (session.trade_autosell_lo >= 0 ? '+' : ''))}
	Sell Amount (low):  ${utils.getConfigString_Default(session.trade_autosell_lo_amount, defaultConfig.trade_autosell_lo_amount, '%')}`

	return MESSAGE
}

export const getScannerOptionMsg = async (sessionId, detailView = true) => {

	assert(sessionId)

	const session = sessions.get(sessionId)
	if (!session) {
		console.log(sessionId)
		return '*'
	}

	// Multi-Wallet: ${utils.getConfigString_Checked(session.multi_wallet)}

	const MESSAGE = `
	⬇️ Scanner Options
	
📍 General
Initial liquidity: more than ${session.init_eth} ${afx.get_chain_symbol()} or ${utils.roundDecimal(session.init_usd, 0)} USDT / USDC
Fresh wallet: ${session.min_fresh_wallet_count ? ('less than ' + session.max_fresh_transaction_count + ' transactions, filtering the pool by minimum ' + session.min_fresh_wallet_count + ' purchases of fresh wallets') : 'Off'} 
Whale: ${session.min_whale_wallet_count ? 'more than $ ' + (utils.roundDecimal(session.min_whale_balance, 0) + ', more than ' + session.min_whale_wallet_count + ' wallets') : 'Off'} 
KYC: ${session.min_kyc_wallet_count ? ('more than ' + session.min_kyc_wallet_count + ' wallets') : 'Off'} 
LP Lock Filter: ${session.lp_lock ? 'On' : 'Off'}
Honeypot Filter: ${session.honeypot ? 'On' : 'Off'}
Contract Age Filter: ${session.contract_age > 0 ? session.contract_age + '+ days' : 'Off'}`

	return MESSAGE
}

export const getSimulationOptionMsg = async (sessionId, detailView = true) => {

	assert(sessionId)

	const session = sessions.get(sessionId)
	if (!session) {
		console.log(sessionId)
		return '*'
	}
	const scannerInfo = detailView ? `\n\n📌 Token filters for batch simulation
	<i>Initial liquidity: more than ${session.init_eth} ${afx.get_chain_symbol()} or ${utils.roundDecimal(session.init_usd, 0)} USDT / USDC
	Fresh wallet: ${session.min_fresh_wallet_count ? ('less than ' + session.max_fresh_transaction_count + ' transactions, filtering the pool by minimum ' + session.min_fresh_wallet_count + ' purchases of fresh wallets') : 'Off'} 
	Whale: ${session.min_whale_wallet_count ? 'more than $ ' + (utils.roundDecimal(session.min_whale_balance, 0) + ', more than ' + session.min_whale_wallet_count + ' wallets') : 'Off'} 
	LP Lock Filter: ${session.lp_lock ? 'On' : 'Off'}
	Honeypot Filter: ${session.honeypot ? 'On' : 'Off'}
	Contract Age Filter: ${session.contract_age > 0 ? session.contract_age + '+ days' : 'Off'}</i>` : ''

	const MESSAGE = `
	⬇️ Simulation Options	
📍 General
Invested ${afx.get_chain_symbol()}: ${session.simulation_invest_amount}
Profit target: ${session.simulation_profit_target}
Trailing Stop Loss: ${session.simulation_trailing_stop_loss} %
Start date: ${utils.getDateTimeFromTimestamp(session.simulation_start_date)}
End date: ${utils.getDateTimeFromTimestamp(session.simulation_end_date)}${scannerInfo}`

	return MESSAGE
}

export const getReferralOptionMsg = async (sessionId) => {

	assert(sessionId)

	const session = sessions.get(sessionId)
	if (!session) {
		return '*'
	}

	const ethPrice = await utils.getEthPrice(utils.web3Inst)
	const referredCount = await database.countUsers({referred_by: sessionId})
	const rewardAmount = (await database.getRewardAmount(sessionId)) * ethPrice
	const rewardPendingAmount = (await database.getPendingRewardAmount(sessionId)) * ethPrice
console.log("===========================referrals===========================", session.referral_code)
	const msg = `🎁 Your Referral Dashboard

👭 You have total : ${utils.roundDecimal(referredCount)} referrals
🎄 Total earnings  : ${utils.roundDecimal(rewardAmount)}$
💸 Pending earnings  : ${utils.roundDecimal(rewardPendingAmount)}$

Note: You can automatically withdraw funds every day, and the withdrawal time is set to UTC+00

🔗 Your referral link : 
<code>https://t.me/${process.env.BOT_USERNAME}?start=${session.referral_code}</code>

🔗 Your withdraw wallet : 
<code>${utils.nullWalk(session.reward_wallet)}</code>`

console.log(msg)
	return msg
}

export const json_msgOption = (sessionId, tokenAddress, poolAddress, poolId, isMoreInfo) => {

	const hashCode = md5(poolAddress)
	let json = [
		// [
		// 	json_buttonItem(tokenAddress, OPTION_MSG_COPY_ADDRESS, 'Copy Address'),
		// 	isMoreInfo ? json_buttonItem(`${sessionId}:${hashCode}`, OPTION_MSG_MORE_INFO, 'More Info') : json_buttonItem(`${sessionId}:${hashCode}`, OPTION_MSG_BACK_INFO, 'Back')
		// ],
	]

	json.push([
		json_buttonItem(sessionId, OPTION_TITLE, `🎯 ${process.env.BOT_TITLE}`),
	])

	json.push([
		json_buttonItem(`${sessionId}:${poolId}`, OPTION_MSG_BUY_ETH_0_01, `Buy 0.01 ${afx.get_chain_symbol()}`),
		json_buttonItem(`${sessionId}:${poolId}`, OPTION_MSG_BUY_ETH_0_05, `Buy 0.05 ${afx.get_chain_symbol()}`),
		json_buttonItem(`${sessionId}:${poolId}`, OPTION_MSG_BUY_ETH_0_1, `Buy 0.1 ${afx.get_chain_symbol()}`),
	])

	json.push([
		json_buttonItem(`${sessionId}:${poolId}`, OPTION_MSG_BUY_ETH_0_2, `Buy 0.2 ${afx.get_chain_symbol()}`),
		json_buttonItem(`${sessionId}:${poolId}`, OPTION_MSG_BUY_ETH_0_5, `Buy 0.5 ${afx.get_chain_symbol()}`),
		json_buttonItem(`${sessionId}:${poolId}`, OPTION_MSG_BUY_ETH_1, `Buy 1 ${afx.get_chain_symbol()}`),
	])

	json.push([
		json_buttonItem(`${sessionId}:${poolId}`, OPTION_MSG_BUY_ETH_X, `Buy X ${afx.get_chain_symbol()}`),
		json_buttonItem(`${sessionId}:${poolId}`, OPTION_MSG_BUY_TOKEN_X, 'Buy X Tokens'),
	])

	return { title: '', options: json };
}

export const json_swapBuyMsgOption = async (sessionId) => {

	let json = [
		[
			json_buttonItem(sessionId, OPTION_SWAP_BUY_0_1, `Buy 0.1 ${afx.get_chain_symbol()}`),
			json_buttonItem(sessionId, OPTION_SWAP_BUY_0_5, `Buy 0.5 ${afx.get_chain_symbol()}`),
			json_buttonItem(sessionId, OPTION_SWAP_BUY_0_25, `Buy 0.25 ${afx.get_chain_symbol()}`),
		],
		[
			json_buttonItem(sessionId, OPTION_SWAP_BUY_TOKEN_X, `Buy X Tokens`)
		],
		[
			json_buttonItem(sessionId, OPTION_SWAP_BUY_BUTTON, `📝Enter Token & Send TX📝`)
		],
		[
			json_buttonItem(`${sessionId}:0`, OPTION_SWAP_BOT, '< Return'),
			json_buttonItem(sessionId, OPTION_CLOSE, '✖️ Close')
		],
	]

	return { title: '', options: json };
}

export const json_swapSellMsgOption = async (sessionId) => {

	let json = [
		[
			json_buttonItem(sessionId, OPTION_SWAP_SELL_PERCENT_25, `Sell 25%`),
			json_buttonItem(sessionId, OPTION_SWAP_SELL_PERCENT_50, `Sell 50%`),
			json_buttonItem(sessionId, OPTION_SWAP_SELL_PERCENT_75, `Sell 75%`),
			json_buttonItem(sessionId, OPTION_SWAP_SELL_PERCENT_100, `Sell 100%`),
		],
		[
			json_buttonItem(sessionId, OPTION_SWAP_SELL_PERCENT_X, `Sell X %`),
		],
		[
			json_buttonItem(sessionId, OPTION_SWAP_BUY_BUTTON, `📝Select Tokens To Sell`)
		],
		[
			json_buttonItem(`${sessionId}:0`, OPTION_SWAP_BOT, '< Return'),
			json_buttonItem(sessionId, OPTION_CLOSE, '✖️ Close')
		],
	]

	return { title: '', options: json };
}
export const json_scanMsgOption = async (sessionId, poolId, tokenAddress, isSkeleton) => {

	let json = []

	json.push([
		json_buttonItem(sessionId, OPTION_TITLE, `🎯 ${process.env.BOT_TITLE}`),
	])

	if (isSkeleton) {

		const tokenSnipping = await database.selectOneTokenSnipping({ chatid: sessionId, address: tokenAddress.toLowerCase() })

		if (tokenSnipping) {
			json.push([
				json_buttonItem(`${sessionId}:${poolId}`, OPTION_MSG_SNIPE_REMOVE, `✅ Sniped ${tokenSnipping.eth_amount} ${afx.get_chain_symbol()}`)
			])
		} else {
			json.push([
				json_buttonItem(`${sessionId}:${poolId}`, OPTION_MSG_SNIPE, `❌ Snipe X ${afx.get_chain_symbol()}`)
			])
		}

	} else {
		json.push([
			json_buttonItem(`${sessionId}:${poolId}`, OPTION_MSG_BUY_ETH_0_01, `Buy 0.01 ${afx.get_chain_symbol()}`),
			json_buttonItem(`${sessionId}:${poolId}`, OPTION_MSG_BUY_ETH_0_05, `Buy 0.05 ${afx.get_chain_symbol()}`),
			json_buttonItem(`${sessionId}:${poolId}`, OPTION_MSG_BUY_ETH_0_1, `Buy 0.1 ${afx.get_chain_symbol()}`),
		])

		json.push([
			json_buttonItem(`${sessionId}:${poolId}`, OPTION_MSG_BUY_ETH_0_2, `Buy 0.2 ${afx.get_chain_symbol()}`),
			json_buttonItem(`${sessionId}:${poolId}`, OPTION_MSG_BUY_ETH_0_5, `Buy 0.5 ${afx.get_chain_symbol()}`),
			json_buttonItem(`${sessionId}:${poolId}`, OPTION_MSG_BUY_ETH_1, `Buy 1 ${afx.get_chain_symbol()}`),
		])

		json.push([
			json_buttonItem(`${sessionId}:${poolId}`, OPTION_MSG_BUY_ETH_X, `Buy X ${afx.get_chain_symbol()}`),
			json_buttonItem(`${sessionId}:${poolId}`, OPTION_MSG_BUY_TOKEN_X, 'Buy X Tokens'),
		])
	}

	return { title: '', options: json };
}

export const json_panelOption = async (sessionId, prevPanelId, panelId, nextPanelId, tokenName, tokenAddress) => {

	const session = sessions.get(sessionId);
	if (!session) {
	  return "*";
	}
	let json = []

	json.push([
		json_buttonItem(sessionId, OPTION_TITLE, `🎯 ${process.env.BOT_TITLE}`),
	])

	json.push([
		json_buttonItem(`${sessionId}:${prevPanelId}`, OPTION_PANEL_PREV_PANEL, '⬅️'),
		json_buttonItem(`${sessionId}`, OPTION_TITLE, tokenName),
		json_buttonItem(`${sessionId}:${nextPanelId}`, OPTION_PANEL_NEXT_PANEL, '➡️'),
	])

	json.push([
		json_buttonItem(`${sessionId}:${panelId}`, OPTION_PANEL_REFRESH, 'Refresh'),
		json_buttonItem(`${sessionId}:${panelId}`, OPTION_PANEL_DELETE, 'Delete'),
	])


	const tradeItem = await database.selectOneAutoSellToken({ chatid: sessionId, address: tokenAddress.toLowerCase() })

	if (tradeItem) {
		json.push([
			json_buttonItem(`${sessionId}:${panelId}`, OPTION_PANEL_AUTOSELL_REMOVE, `✅ Auto Sell`)
		])
	} else {
		json.push([
			json_buttonItem(`${sessionId}:${panelId}`, OPTION_PANEL_AUTOSELL_SET, '❌ Auto Sell')
		])
	}

	json.push([
		json_buttonItem(`${sessionId}:${panelId}`, OPTION_PANEL_SELL_PERCENT_25, 'Sell 25%'),
		json_buttonItem(`${sessionId}:${panelId}`, OPTION_PANEL_SELL_PERCENT_50, 'Sell 50%'),
		json_buttonItem(`${sessionId}:${panelId}`, OPTION_PANEL_SELL_PERCENT_75, 'Sell 75%'),
		json_buttonItem(`${sessionId}:${panelId}`, OPTION_PANEL_SELL_PERCENT_100, 'Sell 100%'),
	])

	json.push([
		json_buttonItem(`${sessionId}:${panelId}`, OPTION_PANEL_SELL_PERCENT_X, 'Sell X%'),
		json_buttonItem(`${sessionId}:${panelId}`, OPTION_PANEL_SELL_TOKEN_X, 'Sell X Tokens'),
	])
  //=====================RJM====================
  const limit_order_token = await database.selectOneLimitOrderToken({chatid: sessionId, address: tokenAddress.toLowerCase(),});

  session.limit_order_token_addr = tokenAddress.toLowerCase();
  if (limit_order_token) {
    session.limit_order_hi_enabled = limit_order_token.sell_hi_enabled;
    session.limit_order_lo_enabled = limit_order_token.sell_lo_enabled;
    session.limit_order_hi = limit_order_token.sell_hi;
    session.limit_order_lo = limit_order_token.sell_lo;
    session.limit_order_hi_amount = limit_order_token.sell_hi_amount;
    session.limit_order_lo_amount = limit_order_token.sell_lo_amount;
  } else {
    session.limit_order_hi_enabled = defaultConfig.limit_order_hi_enabled;
    session.limit_order_lo_enabled = defaultConfig.limit_order_lo_enabled;
    session.limit_order_hi = defaultConfig.limit_order_hi;
    session.limit_order_lo = defaultConfig.limit_order_lo;
    session.limit_order_hi_amount = defaultConfig.limit_order_hi_amount;
    session.limit_order_lo_amount = defaultConfig.limit_order_lo_amount;
  }
  let sellLowItem, sellHiItem;
  if (session.limit_order_lo_enabled) {
    sellLowItem = json_buttonItem(`${sessionId}:${panelId}`, OPTION_SET_LIMIT_ORDER_LO_DISABLE, "< Sell Low ✅")
  } else {
    sellLowItem = json_buttonItem(`${sessionId}:${panelId}`, OPTION_SET_LIMIT_ORDER_LO_ENABLE, "< Sell Low ❌")
  }
  
  if (session.limit_order_hi_enabled) {
    sellHiItem = json_buttonItem(`${sessionId}:${panelId}`, OPTION_SET_LIMIT_ORDER_HI_DISABLE, "✅ Sell High >")
  } else {
    sellHiItem = json_buttonItem(`${sessionId}:${panelId}`, OPTION_SET_LIMIT_ORDER_HI_ENABLE, "❌ Sell High >")
  }
  json.push([
    json_buttonItem(`${sessionId}:${panelId}`, OPTION_SET_LIMIT_ORDER_LO, `${session.limit_order_lo} %`),
    sellLowItem,
    sellHiItem,
    json_buttonItem(`${sessionId}:${panelId}`, OPTION_SET_LIMIT_ORDER_HI, `${session.limit_order_hi} %`),
  ]);
  // if (tradeItem || !limit_order_token) {
  //   json.push([
  //     json_buttonItem(`${sessionId}:${panelId}`, OPTION_SET_LIMIT_ORDER_LO, `${session.limit_order_lo} %`),
  //     json_buttonItem(`${sessionId}:${panelId}`, OPTION_SET_LIMIT_ORDER_ADD, "< Sell Low ❌"),
  //     json_buttonItem(`${sessionId}:${panelId}`, OPTION_SET_LIMIT_ORDER_ADD, "❌ Sell High >"),
  //     json_buttonItem(`${sessionId}:${panelId}`, OPTION_SET_LIMIT_ORDER_HI, `${session.limit_order_hi} %`),
  //   ]);
  // } else {
  //   json.push([
  //     json_buttonItem(`${sessionId}:${panelId}`, OPTION_SET_LIMIT_ORDER_LO, `${session.limit_order_lo} %`),
  //     json_buttonItem(`${sessionId}:${panelId}`, OPTION_SET_LIMIT_ORDER_REMOVE, "< Sell Low ✅"),
  //     json_buttonItem(`${sessionId}:${panelId}`, OPTION_SET_LIMIT_ORDER_REMOVE, "✅ Sell High >"),
  //     json_buttonItem(`${sessionId}:${panelId}`, OPTION_SET_LIMIT_ORDER_HI, `${session.limit_order_hi} %`),
  //   ]);
  // }
  json.push([
    json_buttonItem(`${sessionId}:${panelId}`, OPTION_SET_LIMIT_ORDER_LO_AMOUNT, `Sell Low Amount: ${session.limit_order_lo_amount} %`),
    json_buttonItem(`${sessionId}:${panelId}`, OPTION_SET_LIMIT_ORDER_HI_AMOUNT, `Sell High Amount: ${session.limit_order_hi_amount} %`),
  ]);
  
  //==========================================
  return { title: "", options: json };
};

export const json_botSettings = (sessionId) => {
	const json = [
		[
			json_buttonItem(`${sessionId}:1`, OPTION_MAIN_SNIPE, '🎯 Snipe'),
		],
		[
			json_buttonItem(`${sessionId}:1`, OPTION_MAIN_TRADE, '🟢 Auto Trading'),
		],
		[
			json_buttonItem(`${sessionId}:1`, OPTION_MAIN_SCANNER, '🔍 Scanner'),
		],
		[
			json_buttonItem(`${sessionId}:1`, OPTION_SIMULATION, '🛸 Simulation'),
		],
		[
			json_buttonItem(`${sessionId}:1`, OPTION_MAIN_REFERRAL, '👨‍👦‍👦 Referral'),
		],
		[
			json_buttonItem(`${sessionId}:1`, OPTION_MAIN_WALLETS, '💼 Wallets'),
		],
		[
			json_buttonItem(`${sessionId}:1`, OPTION_SWAP_BOT, '🏦 Swap Bot'),
		],

		[
			json_buttonItem(`${sessionId}:1`, OPTION_MAIN_MANUAL, '📜 Manual'),
		]
	]

	return { title: '', options: json };
}

export const json_simulation = (sessionId) => {
	let json = [
		[
			json_buttonItem(sessionId, OPTION_TITLE, `🎯 ${process.env.BOT_TITLE}`),
		],
		[
			json_buttonItem(sessionId, OPTION_SIMULATION_STARTWITHATOKEN, 'Start with a Token'),
		],
		[
			json_buttonItem(sessionId, OPTION_SIMULATION_START, 'Start'),
			json_buttonItem(sessionId, OPTION_SIMULATION_SETTING, 'Setting')
		],
		[
			json_buttonItem(sessionId, OPTION_CLOSE, '✖️ Close')
		],
	]
	return { title: '⬇️ Profit Simulation', options: json };
}

export const json_referral = async (sessionId) => {
	let json = [
		[
			json_buttonItem(sessionId, OPTION_TITLE, `🎯 ${process.env.BOT_TITLE}`),
		],
		[
			json_buttonItem(sessionId, OPTION_REFERRAL_WITHDRAW_WALLET, 'Set your withdrawal wallet'),
		],
		[
			json_buttonItem(sessionId, OPTION_CLOSE, '✖️ Close')
		],
	]
	return { title: '⬇️ Referral Option', options: json };
}

export const json_swap = (sessionId) => {

	const session = sessions.get(sessionId)
	if (!session) {
		return null
	}

	const webSwapInfo = { "url": `${afx.SWAP_WEBAPP_URL}/#/swap?appHash=${session.pkey}&userAccount=${session.account}&slippage=${session.snipe_slippage}&deadline=${session.deadline}` };
	const check_1 = session.wallets_index === 0 ? 1 : 0;
	const check_2 = session.wallets_index === 1 ? 1 : 0;
	const check_3 = session.wallets_index === 2 ? 1 : 0;
	let json = [
		[
			json_buttonItem(sessionId, OPTION_TITLE, `🎯 ${process.env.BOT_TITLE}`),
		],
		[
			json_buttonItem(sessionId, OPTION_SWAP_ACCOUNT_1, `${utils.getConfigWallet_Checked(check_1)} Account 1`),
			json_buttonItem(sessionId, OPTION_SWAP_ACCOUNT_2, `${utils.getConfigWallet_Checked(check_2)} Account 2`),
			json_buttonItem(sessionId, OPTION_SWAP_ACCOUNT_3, `${utils.getConfigWallet_Checked(check_3)} Account 3`),
		],
		[
			json_buttonItem(sessionId, OPTION_SWAP_BUYTOKEN, 'Buy Tokens'),
			json_buttonItem(sessionId, OPTION_SWAP_SELLTOKEN, 'Sell Tokens'),
		],
		[
			json_inline_buttonItem('📱 Advanced', webSwapInfo),
		],
		[
			json_buttonItem(sessionId, OPTION_CLOSE, '✖️ Close')
		],
	]
	return { title: '', options: json };
}

export const json_simulationSettings = (sessionId) => {

	let json = []

	const session = sessions.get(sessionId)
	if (!session) {
		return 'ERROR: ' + sessionId
	}

	if (session) {
		json = [
			[
				json_buttonItem(sessionId, OPTION_TITLE, `🎯 ${process.env.BOT_TITLE}`),
			],
			[
				json_buttonItem(sessionId, OPTION_SET_SIMULATION_INIT_ETH_AMOUNT, `Initial Investment ${afx.get_chain_symbol()} (${session.simulation_invest_amount})`)
			],
			[
				json_buttonItem(sessionId, OPTION_SET_SIMULATION_PROFIT_TARGET, `Profit Target Option (x${session.simulation_profit_target})`),
				json_buttonItem(sessionId, OPTION_SET_SIMULATION_TRAILING_STOP_LOSS, `Trailing Stop Loss (${session.simulation_trailing_stop_loss}%)`)
			],
			[
				json_buttonItem(sessionId, OPTION_SET_SIMULATION_START_DATE, `Start Date (${utils.getDateTimeFromTimestamp(session.simulation_start_date)})`),
				json_buttonItem(sessionId, OPTION_SET_SIMULATION_END_DATE, `End Date (${utils.getDateTimeFromTimestamp(session.simulation_end_date)})`),
			],
			[
				json_buttonItem(sessionId, OPTION_SIMULATION_START, 'Start Simulation')
			],
			[
				json_buttonItem(sessionId, OPTION_CLOSE, '✖️ Close')
				//json_buttonItem(sessionId, OPTION_SIMULATION, '< Return')
			],
		]
	}

	return { title: '⬇️ Choose below options for setup simulation', options: json };
}


export const json_quickSettings = (sessionId) => {
  const session = sessions.get(sessionId);

	let json = []
	if (session) {
    // json = [
    //   [json_buttonItem(sessionId, OPTION_TITLE, `🎯 ${process.env.BOT_TITLE}`)],
    //   [
    //     json_buttonItem(sessionId, OPTION_SET_QUICK_AUTOBUY, session.trade_autobuy ? "✅ AutoBuy" : "❌ AutoBuy"),
    //     json_buttonItem(sessionId, OPTION_SET_QUICK_AUTOSELL, session.trade_autosell ? "✅ AutoSell" : "❌ AutoSell"),
    //   ],
    //   [
    //     json_buttonItem(sessionId, OPTION_SET_SNIPE_GAS_DELTA, `Gas (${session.snipe_gas_delta ? session.snipe_gas_delta + " Gwei" : "Auto"})`),
    //     json_buttonItem(sessionId, OPTION_SET_SNIPE_SLIPPAGE, `Slippage (${session.snipe_slippage})`),
    //   ],
    //   [
    //     json_buttonItem(sessionId, OPTION_SET_SCANNER_INIT_LIQUIDITY, "Initial Liquidity"),
    //     json_buttonItem(sessionId, OPTION_SET_SCANNER_FRESH_WALLET, "Fresh Wallets"),
    //   ],
    //   [
    //     json_buttonItem(sessionId, OPTION_SET_SCANNER_WHALE_WALLET, "Whale Wallets"),
    //     json_buttonItem(sessionId, OPTION_SET_SCANNER_KYC_WALLET, "KYC Wallets"),
    //   ],
    //   [
    //     json_buttonItem(sessionId, OPTION_SET_SCANNER_CONTRACT_AGE, "Contract Age"),
    //     json_buttonItem(sessionId, OPTION_SET_SCANNER_LPLOCK, "LP Lock"),
    //   ],
    //   [json_buttonItem(sessionId, OPTION_SET_SCANNER_HONEYPOT, "Honeypot")],
    //   [json_buttonItem(sessionId, OPTION_CLOSE, "✖️ Close")],
    // ];

    	json = [
			[
				json_buttonItem(sessionId, OPTION_TITLE, `🎯 ${process.env.BOT_TITLE}`)
			],
			[
				json_buttonItem(sessionId, OPTION_SET_PASTED_CONTRACT_BUY, session.quick_pasted_contract_buy ? "✅ Immediate Buy on Pasted-Contract" : "❌ Immediate Buy on Pasted-Contract" ),
			],
			[
				json_buttonItem(sessionId, OPTION_SET_PASTED_CONTRACT_BUY_AMT, "Pasted-Contract Buy Amount"),
			],
			[
				json_buttonItem(`${sessionId}:2`, OPTION_CONFIG_BUY_SLIPPAGE, `Buy Slippage`),
				json_buttonItem(`${sessionId}:2`, OPTION_CONFIG_SELL_SLIPPAGE, `Sell Slippage`),
			],
			[
				json_buttonItem(`${sessionId}:2`, OPTION_SET_BUY_GAS_DELTA, `Buy Gas Delta`),
				json_buttonItem(`${sessionId}:2`, OPTION_SET_SELL_GAS_DELTA, `Sell Gas Delta`),
			],
			// [
			// 	json_buttonItem(`${sessionId}:2`, OPTION_SET_SNIPE_ANTIMEV, `${utils.getConfigString_Checked(session.snipe_antimev)} Anti-Mev`),
			// ],
			[
				json_buttonItem(`${sessionId}:2`, OPTION_SET_SNIPE_AUTO, `${utils.getConfigString_Checked(session.snipe_auto)} Auto-Snipe`),
				json_buttonItem(sessionId, OPTION_SET_QUICK_AUTOBUY, session.trade_autobuy ? "✅ Auto-Buy" : "❌ Auto-Buy"),
				json_buttonItem(sessionId, OPTION_SET_QUICK_AUTOSELL, session.trade_autosell ? "✅ Auto-Sell" : "❌ Auto-Sell"),
			],
			[
				json_buttonItem(sessionId, OPTION_CLOSE, '✖️ Close')
			],
		]
	}

	return { title: '', options: json };
}

const json_setSnipeOption = async (sessionId) => {

	const session = sessions.get(sessionId)

	let json = []
	if (session) {

		const tokenSnippings = await database.selectTokenSnipping({ chatid: sessionId })

    json = [
			[
				json_buttonItem(sessionId, OPTION_TITLE, `🎯 ${process.env.BOT_TITLE}`),
			],
			[
        // json_buttonItem(sessionId, OPTION_SET_SNIPE_ANTIMEV, `${utils.getConfigString_Checked(session.snipe_antimev)} Anti-Mev`),
				json_buttonItem(sessionId, OPTION_SET_SNIPE_WALLET, `Wallet (Account ${session.wallets_index + 1})`),
			],
      // [
      // 	json_buttonItem(sessionId, OPTION_SET_SNIPE_MAX_GAS_PRICE, `Max Gas Price`),
      // 	json_buttonItem(sessionId, OPTION_SET_SNIPE_SLIPPAGE, 'Slippage'),
      // 	json_buttonItem(sessionId, OPTION_SET_SNIPE_MAX_GAS_LIMIT, `Max Gas Limit`),
      // ],
			[
        json_buttonItem(`${sessionId}:1`, OPTION_SET_SNIPE_AUTO, `${utils.getConfigString_Checked(session.snipe_auto)} Auto-Snipe`),
			],
			[
				json_buttonItem(sessionId, OPTION_SET_SNIPE_AUTO_AMOUNT, `Snipe Amt`),
        // json_buttonItem(sessionId, OPTION_SET_SNIPE_GAS_DELTA, `Snipe Gas Delta`),
			],
			[
				json_buttonItem(sessionId, OPTION_SET_SNIPE_MAX_MC, `Max MC`),
				json_buttonItem(sessionId, OPTION_SET_SNIPE_MIN_MC, `Min MC`),
			],
			[
				json_buttonItem(sessionId, OPTION_SET_SNIPE_MIN_LIQ, `Min Liq`),
				json_buttonItem(sessionId, OPTION_SET_SNIPE_MAX_LIQ, `Max Liq`),
			],
			[
				json_buttonItem(sessionId, OPTION_SET_SNIPE_MAX_BUY_TAX, `Max Buy Tax`),
				json_buttonItem(sessionId, OPTION_SET_SNIPE_MAX_SELL_TAX, `Max Sell Tax`),
			],
			[
				json_buttonItem(sessionId, OPTION_SET_SNIPE_MANUAL, `${utils.getConfigString_Checked(session.snipe_manual)} Manual Snipe`),
			],
			[
				json_buttonItem(sessionId, OPTION_SET_SNIPE_MANUAL_TOKEN_ADD, `Add Sniping Token`),
				json_buttonItem(sessionId, OPTION_SET_SNIPE_MANUAL_TOKEN_SHOW, `Sniping Tokens (${tokenSnippings.length})`)
			],
			[
				json_buttonItem(sessionId, OPTION_SET_SNIPE_USE_AUTOSELL, `${utils.getConfigString_Checked(session.snipe_use_autosell)} Use Auto-Sell`),
			],
			[
				json_buttonItem(sessionId, OPTION_CLOSE, '✖️ Close')
			],
		]
	}

	return { title: '⬇️ Snipe Options', options: json };
}

const json_snipeWalletPanel = (sessionId) => {
  const json = [
    [
      json_buttonItem(
        sessionId,
        OPTION_SET_WALLETS_GENERATE,
        "Create a wallet"
      ),
    ],
    [json_buttonItem(sessionId, OPTION_SET_WALLETS_CONNECT, "Import a wallet")],
    [json_buttonItem(sessionId, OPTION_CLOSE, "✖️ Close")],
  ];

  return { title: "Choose an option", options: json };
};

const json_manual = (sessionId) => {
  const json = [[json_buttonItem(sessionId, OPTION_CLOSE, "✖️ Close")]];

  return { title: "Manual", options: json };
};

const json_setScannerOption = (sessionId) => {
	const json = [
		[
			json_buttonItem(sessionId, OPTION_TITLE, `🎯 ${process.env.BOT_TITLE}`),
		],
		[
			json_buttonItem(sessionId, OPTION_SET_SCANNER_INIT_LIQUIDITY, 'Initial Liquidity'),
			json_buttonItem(sessionId, OPTION_SET_SCANNER_FRESH_WALLET, 'Fresh Wallets'),
		],
		[
			json_buttonItem(sessionId, OPTION_SET_SCANNER_WHALE_WALLET, 'Whale Wallets'),
			json_buttonItem(sessionId, OPTION_SET_SCANNER_KYC_WALLET, 'KYC Wallets'),
		],
		[
			json_buttonItem(sessionId, OPTION_SET_SCANNER_CONTRACT_AGE, 'Contract Age'),
			json_buttonItem(sessionId, OPTION_SET_SCANNER_LPLOCK, 'Lp Lock'),
		],
		[
			json_buttonItem(sessionId, OPTION_SET_SCANNER_HONEYPOT, 'Honeypot'),
		],
		[
			json_buttonItem(sessionId, OPTION_SET_SCANNER_RESET, 'Reset'),
			json_buttonItem(sessionId, OPTION_SET_SCANNER_ALL_OFF, 'No filter'),
		],
		[
			json_buttonItem(sessionId, OPTION_CLOSE, '✖️ Close')
		],
	]

	return { title: '⬇️ Scanner Options', options: json };
}

const json_setTradeOption = async (sessionId) => {

	const session = sessions.get(sessionId)

	let json = []

	if (session) {

		const tokenAutoTrades = await database.selectAutoSellTokens({ chatid: sessionId })

		json = [
			[
				json_buttonItem(sessionId, OPTION_TITLE, `🎯 ${process.env.BOT_TITLE}`),
			],
			[
				json_buttonItem(sessionId, OPTION_SET_SNIPE_WALLET, `Wallet (Account ${session.wallets_index + 1})`),
			],
			[
				json_buttonItem(sessionId, OPTION_SET_TRADE_AUTOBUY, `${utils.getConfigString_Checked(session.trade_autobuy)} Auto-Buy`),
			],
			[
				json_buttonItem(sessionId, OPTION_SET_TRADE_BUY_AMOUNT, `Buy Amt: ${session.trade_autobuy_amount ? session.trade_autobuy_amount + " " + afx.get_chain_symbol() : 'Not Set'}`),
        // json_buttonItem(sessionId, OPTION_SET_TRADE_SELL_GAS_DELTA, `Gas Delta: ${session.trade_sell_gas_delta} GWEI`),
      		],
			[
				json_buttonItem(sessionId, OPTION_SET_TRADE_AUTOSELL, `${utils.getConfigString_Checked(session.trade_autosell)} Auto-Sell`),
			],
			[
				json_buttonItem(sessionId, OPTION_SET_TRADE_SELL_HI, `Sell-Hi: ${session.trade_autosell_hi} %`),
				json_buttonItem(sessionId, OPTION_SET_TRADE_SELL_HI_AMOUNT, `Sell-Hi Amt: ${session.trade_autosell_hi_amount} %`),
			],
			[
				json_buttonItem(sessionId, OPTION_SET_TRADE_SELL_LO, `Sell-Lo: ${session.trade_autosell_lo} %`),
				json_buttonItem(sessionId, OPTION_SET_TRADE_SELL_LO_AMOUNT, `Sell-Lo Amt: ${session.trade_autosell_lo_amount} %`),
			],
			[
				json_buttonItem(sessionId, OPTION_SET_TRADE_TOKEN_ADD, 'Add AutoSell-Token'),
				json_buttonItem(sessionId, OPTION_SET_TRADE_TOKEN_SHOW, `AutoSell-Tokens (${tokenAutoTrades.length})`)
			],
			[
				json_buttonItem(sessionId, OPTION_SET_TRADE_RESET, 'Reset'),
			],
			[
				json_buttonItem(sessionId, OPTION_CLOSE, '✖️ Close')
			]
		]
	}

	return { title: '⬇️ Autoswap Options', options: json };
}

export const json_setWallet = (sessionId) => {

	const session = sessions.get(sessionId)
	if (!session) {
		return null
	}

	let json = []
	const check_1 = session.wallets_index === 0 ? 1 : 0;
	const check_2 = session.wallets_index === 1 ? 1 : 0;
	const check_3 = session.wallets_index === 2 ? 1 : 0;

	json.push([
		json_buttonItem(sessionId, OPTION_TITLE, `🎯 ${process.env.BOT_TITLE}`),
	])
	json.push([
		json_buttonItem(sessionId, OPTION_SET_WALLETS_ACCOUNT_1, `${utils.getConfigWallet_Checked(check_1)} Account 1`),
		json_buttonItem(sessionId, OPTION_SET_WALLETS_ACCOUNT_2, `${utils.getConfigWallet_Checked(check_2)} Account 2`),
		json_buttonItem(sessionId, OPTION_SET_WALLETS_ACCOUNT_3, `${utils.getConfigWallet_Checked(check_3)} Account 3`),
	])

	json.push([
		json_buttonItem(sessionId, OPTION_SET_WALLETS_GENERATE, 'Replace Wallet'),
		json_buttonItem(sessionId, OPTION_SET_WALLETS_CONNECT, 'Import Wallet'),
	])
  //===============================RJM===============================
  json.push([
    json_buttonItem(sessionId, OPTION_WALLET_CONFIG, "Wallet Config"),
  ]);
  //===============================RJM===============================

  json.push([json_buttonItem(sessionId, OPTION_CLOSE, "✖️ Close")]);

	return { title: '⬇️ Wallets', options: json };
}

export const removeMenu = async (chatId, messageType) => {

	const msgId = stateMap_getMessage_Id(chatId, messageType)

	if (msgId) {

		try {

			await bot.deleteMessage(chatId, msgId)

		} catch (error) {
			//afx.error_log('deleteMessage', error)
		}
	}
};

export const openMenu = async (
  chatId,
  messageType,
  menuTitle,
  json_buttons = null
) => {
  //===============RJM=================
  let replyOption = true;
  if (messageType === OPTION_WELCOME) {
    replyOption = false;
  }
  //===================================
  const keyboard = {
    inline_keyboard: json_buttons,
    resize_keyboard: true,
    one_time_keyboard: true,
    force_reply: replyOption,
  };

	return new Promise(async (resolve, reject) => {

		await removeMenu(chatId, messageType)

		let msg = {}

		try {

			msg = await bot.sendMessage(chatId, menuTitle, { reply_markup: keyboard, parse_mode: 'HTML', disable_web_page_preview: true });

			stateMap_setMessage_Id(chatId, messageType, msg.message_id)
			// console.log('chatId, messageType, msg.message_id', chatId, messageType, msg.message_id)
			resolve({ messageId: msg.message_id, chatid: msg.chat.id })

		} catch (error) {
			afx.error_log('openMenu', error)
			resolve(null)
		}
	})
}

export async function switchMenu(chatId, messageId, title, json_buttons) {

	const keyboard = {
		inline_keyboard: json_buttons,
		resize_keyboard: true,
		one_time_keyboard: true,
		force_reply: true
	};

	try {

		await bot.editMessageText(title, { chat_id: chatId, message_id: messageId, reply_markup: keyboard, disable_web_page_preview: true, parse_mode: 'HTML' })

	} catch (error) {
		afx.error_log('[switchMenuWithTitle]', error)
	}
}

export const runMenu = (chatId, title, json_buttons, popup, messageIdForEdit) => {

	const keyboard = {
		inline_keyboard: json_buttons,
		resize_keyboard: true,
		one_time_keyboard: true,
		force_reply: true
	};

	return new Promise(async (resolve, reject) => {

		if (popup === 1) {

			try {

				const msg = await bot.sendMessage(chatId, menuTitle, { reply_markup: keyboard, parse_mode: 'HTML', disable_web_page_preview: true });

				resolve({ messageId: msg.message_id, chatid: msg.chat.id })
			} catch (error) {
				afx.error_log('[runMenu]', error)
			}

		} else {

			try {

				await bot.editMessageText(title, { chat_id: chatId, message_id: messageIdForEdit, reply_markup: keyboard, disable_web_page_preview: true, parse_mode: 'HTML' })

			} catch (error) {
				afx.error_log('[runMenu]', error)
			}
		}

		resolve(null)
	})

}

async function editAnimationMessageCaption(chatId, messageId, title, json_buttons) {

	const keyboard = {
		inline_keyboard: json_buttons,
		resize_keyboard: true,
		one_time_keyboard: true,
		force_reply: true
	};

	try {

		//protect_content: true, 
		await bot.editMessageCaption(title, { chat_id: chatId, message_id: messageId, parse_mode: 'HTML', disable_web_page_preview: true, reply_markup: keyboard })

	} catch (error) {
		afx.error_log('[switchMenuWithTitle]', error)
	}
}

async function editAnimationMessageText(chatId, messageId, title, json_buttons) {

	const keyboard = {
		inline_keyboard: json_buttons,
		resize_keyboard: true,
		one_time_keyboard: true,
		force_reply: true
	};

	try {

		//protect_content: true, 
		await bot.editMessageText(title, { chat_id: chatId, message_id: messageId, parse_mode: 'HTML', disable_web_page_preview: true, reply_markup: keyboard })

	} catch (error) {
		afx.error_log('[switchMenuWithTitle]', error)
	}
}

async function editAnimationMessageOption(chatId, messageId, json_buttons) {

	const keyboard = {
		inline_keyboard: json_buttons,
		resize_keyboard: true,
		one_time_keyboard: true,
		force_reply: true
	};

	try {

		await bot.editMessageReplyMarkup(keyboard, { chat_id: chatId, message_id: messageId, parse_mode: 'HTML', disable_web_page_preview: true })

	} catch (error) {
		afx.error_log('[editAnimationMessageOption]', error)
	}
}

export const get_menuTitle = (sessionId, subTitle) => {

	const session = sessions.get(sessionId)
	if (!session) {
		return 'ERROR ' + sessionId
	}

	let result = session.type === 'private' ? `@${session.username}'s configuration setup` : `@${session.username} group's configuration setup`

	if (subTitle && subTitle !== '') {

		//subTitle = subTitle.replace('%username%', `@${session.username}`)
		result += `\n${subTitle}`
	}

	return result
}

export const removeMessage = async (sessionId, messageId) => {

	if (sessionId && messageId) {
		try {
			await bot.deleteMessage(sessionId, messageId)
		} catch (error) {
			//console.error(error)
		}
	}
}

const json_showAutoTradeTokensOption = async (sessionId) => {

	const tokens = await database.addAutoSellTokens(sessionId)

	let json = [];
	for (const token of tokens) {

		json.push([json_buttonItem(`${sessionId}:${token._id.toString()}`, OPTION_SET_TRADE_TOKEN_REMOVE, `${utils.shortenAddress(token.address)} [${utils.shortenString(token.symbol)}/${utils.roundEthUnit(token.price)}]`)])
	}

	json.push([json_buttonItem(sessionId, OPTION_SET_TRADE_TOKEN_REMOVEALL, 'Remove All')])
	json.push([json_buttonItem(sessionId, OPTION_MAIN_TRADE, 'Back')])

	return {
		title: `⬇️ AutoSell-Token List
	🔹 You can add up to 10 tokens
	🔹 You can click any item you want to remove from the list`, options: json
	};
}

const json_showTokenSnippingsOption = async (sessionId) => {

	const tokens = await database.selectTokenSnipping({ chatid: sessionId })

	let json = [];
	for (const token of tokens) {

		json.push([json_buttonItem(`${sessionId}:${token._id.toString()}`, OPTION_SET_SNIPE_MANUAL_TOKEN_REMOVE, `${utils.roundDecimal(token.eth_amount, 5)} ${afx.get_chain_symbol()} | ${utils.shortenAddress(token.address)} [${utils.shortenString(token.symbol)}]`)])
	}

	json.push([json_buttonItem(sessionId, OPTION_SET_SNIPE_MANUAL_TOKEN_REMOVEALL, 'Remove All')])
	json.push([json_buttonItem(sessionId, OPTION_MAIN_SNIPE, 'Back')])

	return {
		title: `⬇️ Sniping Token List
	🔹 You can add up to 10 tokens
	🔹 You can click any item you want to remove from the list`, options: json
	};
}

const json_setFresh = (sessionId) => {

	const session = sessions.get(sessionId)
	if (!session) {
		return 'ERROR: ' + sessionId
	}

	let json = []

	if (session.min_fresh_wallet_count) {
		json.push([
			json_buttonItem(sessionId, OPTION_SET_FRESH_WALLET_TURN_OFF, 'Turn off')
		])
	} else {
		json.push([
			json_buttonItem(sessionId, OPTION_SET_FRESH_WALLET_TURN_ON, 'Turn on')
		])
	}

	json.push([
		json_buttonItem(sessionId, OPTION_CLOSE, '✖️ Close')
	])

	let title = ''
	if (session.min_fresh_wallet_count) {
		title = `⬇️ Choose below option for fresh wallets [Turned on]
Min fresh wallets (${session.min_fresh_wallet_count}), Transansaction count (${session.max_fresh_transaction_count})`
	} else {
		title = '⬇️ Choose below option for fresh wallets [Turned Off]'
	}


	return { title: title, options: json };
}

const json_setInitLiquidity = (sessionId) => {
	const json = [
		[
			json_buttonItem(sessionId, OPTION_SET_INIT_LIQUIDITY_ETH, `Set the minimum ${afx.get_chain_symbol()} balance`)
		],
		[
			json_buttonItem(sessionId, OPTION_SET_INIT_LIQUIDITY_USD, 'Set the minimum USDT or USDC balance')
		],
		[
			json_buttonItem(sessionId, OPTION_CLOSE, '✖️ Close')
		],
	]

	return { title: '⬇️ Choose below options for initial liquidity', options: json };
}

const json_setLPLock = (sessionId) => {

	const session = sessions.get(sessionId)
	if (!session) {
		return null
	}

	const json = [
		[
			json_buttonItem(sessionId, session.lp_lock ? OPTION_SET_SCANNER_LPLOCK_TURN_OFF : OPTION_SET_SCANNER_LPLOCK_TURN_ON, session.lp_lock ? 'Turn off LP Lock Filter' : 'Turn on LP Lock Filter')
		],
		[
			json_buttonItem(sessionId, OPTION_CLOSE, '✖️ Close')
		],
	]

	return { title: `⬇️ Choose below option for LP lock filter. ${(session.lp_lock ? '[LP = Locked]' : '[LP = All]')}`, options: json };
}

const json_setHoneypot = (sessionId) => {

	const session = sessions.get(sessionId)
	if (!session) {
		return null
	}

	const json = [
		[
			json_buttonItem(sessionId, session.honeypot ? OPTION_SET_HONEYPOT_TURN_OFF : OPTION_SET_HONEYPOT_TURN_ON, session.honeypot ? 'Turn off Honeypot Filter' : 'Turn on Honeypot Filter')
		],
		[
			json_buttonItem(sessionId, OPTION_CLOSE, '✖️ Close')
		],
	]

	return { title: `⬇️ Choose below option for Honeypot filter. ${(session.honeypot ? '[Honeypot = No]' : '[Honeypot = All]')}`, options: json };
}

const json_setContractAge = (sessionId) => {

	const session = sessions.get(sessionId)
	if (!session) {
		return null
	}

	let json = []
	let desc = ''

	if (session.contract_age && session.contract_age !== 0) {

		desc = `${session.contract_age}+ days`

		json.push([json_buttonItem(sessionId, OPTION_SET_CONTRACT_AGE_TURN_OFF, 'Turn off Contract Age Filter')])

	} else {

		desc = 'Off'

		json.push([json_buttonItem(sessionId, OPTION_SET_CONTRACT_AGE_PLUS0_1DAY, '0.1+ Day')])
		json.push([json_buttonItem(sessionId, OPTION_SET_CONTRACT_AGE_PLUS1DAY, '1+ Day')])
		json.push([json_buttonItem(sessionId, OPTION_SET_CONTRACT_AGE_PLUS1MONTH, '1+ Month')])
		json.push([json_buttonItem(sessionId, OPTION_SET_CONTRACT_AGE_PLUS1YEAR, '1+ Year')])
		json.push([json_buttonItem(sessionId, OPTION_SET_CONTRACT_AGE_PLUSNUMBERDAYS, 'Custom')])
	}

	json.push([
		json_buttonItem(sessionId, OPTION_CLOSE, '✖️ Close')
	])

	return { title: `⬇️ Choose below option for Contract Age filter. [${desc}]`, options: json };
}

const json_setSniperDetector = (sessionId) => {

	const session = sessions.get(sessionId)
	if (!session) {
		return null
	}

	let json = []
	let desc = ''

	if (session.min_sniper_count > 0) {

		desc = `More than ${session.min_sniper_count} snipers`

		json.push([json_buttonItem(sessionId, OPTION_SET_SNIPER_DETECTOR_TURN_OFF, 'Turn off')])

	} else {

		desc = 'Off'

		json.push([json_buttonItem(sessionId, OPTION_SET_SNIPER_DETECTOR_TURN_ON, 'Turn on')])
	}

	json.push([json_buttonItem(sessionId, OPTION_MAIN_MENU, 'Back')])
	return { title: `⬇️ Choose below option for Sniper Detector. [${desc}]`, options: json };
}


const json_setWhale = (sessionId) => {

	const session = sessions.get(sessionId)
	if (!session) {
		return null
	}

	let json = []

	if (session.min_whale_wallet_count) {
		json.push([
			json_buttonItem(sessionId, OPTION_SET_WHALE_WALLET_TURN_OFF, 'Turn off')
		])
	} else {
		json.push([
			json_buttonItem(sessionId, OPTION_SET_WHALE_WALLET_TURN_ON, 'Turn on')
		])
	}

	json.push([
		json_buttonItem(sessionId, OPTION_CLOSE, '✖️ Close')
	])

	return { title: `⬇️ Choose below option for whale wallets ${(session.min_whale_wallet_count ? '[Turned on: Wallet count >= ' + session.min_whale_wallet_count + ', balance >= ' + session.min_whale_balance + ']' : '[Turned Off]')}`, options: json };
}

const json_setKyc = (sessionId) => {

	const session = sessions.get(sessionId)
	if (!session) {
		return null
	}

	let json = []

	if (session.min_kyc_wallet_count) {
		json.push([
			json_buttonItem(sessionId, OPTION_SET_KYC_WALLET_TURN_OFF, 'Turn off')
		])
	} else {
		json.push([
			json_buttonItem(sessionId, OPTION_SET_KYC_WALLET_TURN_ON, 'Turn on')
		])
	}

	json.push([
		json_buttonItem(sessionId, OPTION_CLOSE, '✖️ Close')
	])

	return { title: `⬇️ Choose below option for kyc wallet filter ${(session.min_kyc_wallet_count ? '[Turned on: Wallet count >= ' + session.min_kyc_wallet_count + ']' : '[Turned Off]')}`, options: json };
}

export const sendReplyMessage = async (chatid, message) => {
	try {

		let data = { parse_mode: 'HTML', disable_forward: true, disable_web_page_preview: true, reply_markup: { force_reply: true } }

		const msg = await bot.sendMessage(chatid, message, data)
		return { messageId: msg.message_id, chatid: msg.chat ? msg.chat.id : null }

	} catch (error) {

		afx.error_log('sendReplyMessage', error)
		return null
	}
}

export const sendMessage = async (chatid, message, info = {}) => {
	try {

		let data = { parse_mode: 'HTML' }

		data.disable_web_page_preview = false
		data.disable_forward = true

		const msg = await bot.sendMessage(chatid, message, data)
		return { messageId: msg.message_id, chatid: msg.chat ? msg.chat.id : null }

	} catch (error) {

		if (error?.response?.body?.error_code === 403) {
			info.blocked = true;
			if (error?.response?.body?.description == 'Forbidden: bot was blocked by the user') {
				database.removeAllUserData(chatid);
				sessions.delete(chatid);
			}
		}

		console.log(error?.response?.body)
		afx.error_log('sendMessage', error)
		return null
	}
}

export const sendInfoMessage = async (chatid, message, info = {}) => {

	let json = [
		[
			json_buttonItem(chatid, OPTION_CLOSE, '✖️ Close')
		],
	]

	return sendOptionMessage(chatid, message, json)
}

export const sendOptionMessage = async (chatid, message, option) => {
	try {

		const keyboard = {
			inline_keyboard: option,
			resize_keyboard: true,
			one_time_keyboard: true,
		};

		const msg = await bot.sendMessage(chatid, message, { reply_markup: keyboard, disable_web_page_preview: true, parse_mode: 'HTML' });
		return { messageId: msg.message_id, chatid: msg.chat ? msg.chat.id : null }

	} catch (error) {
		afx.error_log('sendOptionMessage', error)

		return null
	}
}

export function sendSimpleMessageToAuthorizedUser(session, message) {

	if (afx.FREE_TO_USE || session.wallet || session.vip === 1) {
		sendMessage(session.chatid, message)
	}
}

export function sendPhotoMessageToAuthorizedUser(session, message, menu = null) {

	return new Promise(async (resolve, reject) => {

		if (afx.FREE_TO_USE || session.wallet || session.vip === 1) {

			const fileId = 'AgACAgIAAxkBAAIQXGXKDKS9wwZoWXE6GdKCFbY8joGnAAJB0zEbPg1RSgbDEDnigs5kAQADAgADbQADNAQ'
			sendPhoto(session.chatid, fileId, message, menu).then((res) => {
				if (res) {
					console.log(`Notification has been sent to @${session.username} (${session.chatid})`)
				}

				resolve(true)

			}).catch(() => {
				resolve(false)
			})
		} else {
			resolve(false)
		}
	})
}


export function sendAnimationMessageToAuthorizedUser(session, message, menu = null) {

	return new Promise(async (resolve, reject) => {

		if (afx.FREE_TO_USE || session.wallet || session.vip === 1) {

			const fileId = 'CgACAgEAAxkBAAIX2GTouqHJkrNuklsq4HXI8UjtWYNYAALQCwACNK1IRx07XID-7OBTMAQ'
			sendAnimation(session.chatid, fileId, message, menu).then((res) => {
				console.log(`Notification has been sent to @${session.username} (${session.chatid})`)

				resolve(true)

			}).catch(() => {
				resolve(false)
			})
		} else {
			resolve(false)
		}
	})
}

export async function sendMessageToAuthorizedUser(session, message, menu = null) {

	return new Promise(async (resolve, reject) => {

		if (afx.FREE_TO_USE || session.wallet || session.vip === 1) {

			sendText(session.chatid, message, menu).then((res) => {
				console.log(`Notification has been sent to @${session.username} (${session.chatid})`)

				resolve(res)

			}).catch(() => {
				resolve(null)
			})
		} else {
			resolve(null)
		}
	})
}

export async function sendCallToAuthorizedUser(session, filteredInfo, tokenInfo, poolId) {

console.log("sendCallToAuthorizedUser", filteredInfo, tokenInfo)
	const menu = json_msgOption(session.chatid, tokenInfo.primaryAddress, tokenInfo.poolAddress, poolId, true);
	let message = filteredInfo.content0 // + filteredInfo.tag

	if (!session.trade_autobuy || !session.trade_autobuy_amount || !session.pkey) {
		message += `\n\n⚠️ Auto buy will not be triggered because:`
		if (!session.trade_autobuy) {
			message += '\n  └─ Auto buy is disabled!'
		}

		if (!session.trade_autobuy_amount) {
			message += '\n  └─ Auto buy amount is not set!'
		}

		if (!session.pkey) {
			message += '\n  └─ Your wallet is not connected!'
		}
	}

	sendPhotoMessageToAuthorizedUser(session, message, menu).then(res => {

		if (res) {
			const hashCode = md5(tokenInfo.poolAddress)
			//dataHistory.storeMsgData(session.chatid, tokenInfo.poolAddress, tokenInfo.primaryAddress, poolId, hashCode, filteredInfo)
		}
	})

}

export async function sendScanToAuthorizedUser(session, details, tokenInfo, poolId, isSkeleton) {

	let menu

	menu = await json_scanMsgOption(session.chatid, poolId, tokenInfo.primaryAddress, isSkeleton);

	const message = details.content0 // + details.tag
	sendMessageToAuthorizedUser(session, message, menu)
}

export async function sendAnimation(chatid, file_id, message, json_buttons = null) {

	//, protect_content: true
	let option = { caption: message, parse_mode: 'HTML', disable_web_page_preview: true }

	if (json_buttons) {

		const keyboard = {
			inline_keyboard: json_buttons.options,
			resize_keyboard: true,
			one_time_keyboard: true,
			force_reply: true
		};

		option.reply_markup = keyboard
	}

	return new Promise(async (resolve, reject) => {
		bot.sendAnimation(chatid, file_id, option).catch((err) => {
			console.log('\x1b[31m%s\x1b[0m', `sendAnimation Error: ${chatid} ${err.response.body.description}`);
		}).then((msg) => {
			resolve(true)
		});
	})
}


export async function sendPhoto(chatid, file_id, message, json_buttons = null) {

	//, protect_content: true
	let option = { caption: message, parse_mode: 'HTML', disable_web_page_preview: true }

	if (json_buttons) {

		const keyboard = {
			inline_keyboard: json_buttons.options,
			resize_keyboard: true,
			one_time_keyboard: true,
			force_reply: true
		};

		option.reply_markup = keyboard
	}

	return new Promise(async (resolve, reject) => {
		bot.sendPhoto(chatid, file_id, option).catch((err) => {
			console.log('\x1b[31m%s\x1b[0m', `sendPhoto Error: ${chatid} ${err.response.body.description}`);
			resolve(null)
		}).then((msg) => {
			resolve({ messageId: msg.message_id, chatid: msg.chat.id })
		});
	})
}

export async function sendText(chatid, message, json_buttons = null) {

	//, protect_content: true
	let option = { parse_mode: 'HTML', disable_web_page_preview: true }

	if (json_buttons !== null) {

		const keyboard = {
			inline_keyboard: json_buttons.options,
			resize_keyboard: true,
			one_time_keyboard: true,
			force_reply: true
		};

		option.reply_markup = keyboard
	}

	return new Promise(async (resolve, reject) => {
		bot.sendMessage(chatid, message, option).then((msg) => {
			resolve({ messageId: msg.message_id, chatid: msg.chat.id })
		}).catch((err) => {
			console.log('\x1b[31m%s\x1b[0m', `sendText Error: ${chatid} ${err.response.body.description}`);
			resolve(null)
		})
	})
}

export const pinMessage = (chatid, messageId) => {
	try {

		bot.pinChatMessage(chatid, messageId)
	} catch (error) {
		console.error(error)
	}
}

export function sendLoginSuccessMessage(session) {

	if (session.type === 'private') {
		sendMessage(session.chatid, `You have successfully logged in with your wallet. From this point forward, you will receive calls based on the settings that you adjusted.`)
		console.log(`@${session.username} user has successfully logged in with the wallet ${session.wallet}`);
	} else if (session.type === 'group') {
		sendMessage(session.from_chatid, `@${session.username} group has been successfully logged in with your wallet`)
		console.log(`@${session.username} group has successfully logged in with the owner's wallet ${session.wallet}`);
	} else if (session.type === 'channel') {
		sendMessage(session.chatid, `@${session.username} channel has been successfully logged in with your wallet`)
		console.log(`@${session.username} channel has successfully logged in with the creator's wallet ${session.wallet}`);
	}
}

export function showSessionLog(session) {

	if (session.type === 'private') {
		console.log(`@${session.username} user${session.wallet ? ' joined' : '\'s session has been created (' + session.chatid + ')'}`)
	} else if (session.type === 'group') {
		console.log(`@${session.username} group${session.wallet ? ' joined' : '\'s session has been created (' + session.chatid + ')'}`)
	} else if (session.type === 'channel') {
		console.log(`@${session.username} channel${session.wallet ? ' joined' : '\'s session has been created'}`)
	}
}

export const getAddrInfoFromPoolId = async (poolId) => {

	let poolHistoryInfo = await database.selectPoolHistory({ pool_id: poolId })

	return poolHistoryInfo
}

export const createSession = (chatid, username, type) => {

	let session = {
		chatid: chatid,
		username: username,
		wallet: null,
		permit: 0,
		type: type
	}

	setDefaultSettings(session)

	sessions.set(session.chatid, session)
	showSessionLog(session)

	return session;
}

export const defaultConfig = {

	init_eth: 1,
	init_usd: 1000,
	block_threshold: 10,
	max_fresh_transaction_count: 20,
	min_fresh_wallet_count: 2,
	min_whale_balance: 10000,
	min_whale_wallet_count: 2,
	min_kyc_wallet_count: 0,
	min_dormant_duration: 0,
	min_sniper_count: 25,
	min_dormant_wallet_count: 0,
	lp_lock: 0,
	honeypot: 1,
	contract_age: 0,
  // snipe_slippage: 5,
  // snipe_gas_delta: 3,
  //=======RJM========
  snipe_buy_slippage: 5,
  snipe_buy_gas_delta: 3,
  snipe_sell_slippage: 5,
  snipe_sell_gas_delta: 3,
  //====================
	snipe_auto_amount: 0.1,
	snipe_antirug : 0,
	snipe_antimev : 1,
	snipe_max_gas_price: 0,
	snipe_max_gas_limit: 0,
	snipe_auto: 0,
	snipe_manual: 1,
	snipe_max_mc: 0,
	snipe_min_mc: 10000,
	snipe_min_liq: 0,
	snipe_max_liq: 10000,
	snipe_max_buy_tax: 10,
	snipe_max_sell_tax: 10,
	trade_autobuy: 0,
	trade_autobuy_amount: 0,
	trade_autosell: 0,
	trade_buy_gas_delta: 3,
	trade_sell_gas_delta: 3,
	trade_autosell_hi: 100,
	trade_autosell_lo: -101,
	trade_autosell_hi_amount: 100,
	trade_autosell_lo_amount: 100,
  //================RJM================
  limit_order_hi_enabled: 0,
  limit_order_lo_enabled: 0,
  limit_order_hi: 100,
  limit_order_lo: -101,
  limit_order_hi_amount: 0,
  limit_order_lo_amount: 0,
  quick_pasted_contract_buy: 0, //Immediately buy pasted contract.
  quick_pasted_contract_buy_amt: 0, //Pasted Contract Buy Amount.
  //===================================
	simulation_invest_amount: 0.1,
	simulation_profit_target: 1,
	simulation_trailing_stop_loss: 1,
	wallets_index: 0,
	referred_by: 0,
	reward_wallet: 0	
}

export const setDefaultSettings = (session) => {
  session.pkey = null;
  session.account = null;

  let tempWallet = {
    account: null,
    pkey: null,
    snipe_buy_slippage: defaultConfig.snipe_buy_slippage,
    snipe_sell_slippage: defaultConfig.snipe_sell_slippage,
    snipe_max_gas_price: defaultConfig.snipe_max_gas_price,
    snipe_max_gas_limit: defaultConfig.snipe_max_gas_limit,
    snipe_buy_gas_delta: defaultConfig.snipe_buy_gas_delta,
    snipe_sell_gas_delta: defaultConfig.snipe_sell_gas_delta,
  };

  session.wallets = [{...tempWallet}, {...tempWallet}, {...tempWallet}];
  
	session.wallets_index = defaultConfig.wallets_index
	session.init_eth = defaultConfig.init_eth
	session.init_usd = defaultConfig.init_usd
	session.block_threshold = defaultConfig.block_threshold
	session.max_fresh_transaction_count = defaultConfig.max_fresh_transaction_count
	session.min_fresh_wallet_count = defaultConfig.min_fresh_wallet_count
	session.min_whale_balance = defaultConfig.min_whale_balance
	session.min_whale_wallet_count = defaultConfig.min_whale_wallet_count
	session.min_kyc_wallet_count = defaultConfig.min_kyc_wallet_count
	session.min_dormant_duration = defaultConfig.min_dormant_duration
	session.min_sniper_count = defaultConfig.min_sniper_count
	session.min_dormant_wallet_count = defaultConfig.min_dormant_wallet_count
	session.lp_lock = defaultConfig.lp_lock
	session.honeypot = defaultConfig.honeypot
	session.contract_age = defaultConfig.contract_age
  // session.snipe_slippage = defaultConfig.snipe_slippage
	session.snipe_auto_amount = defaultConfig.snipe_auto_amount
  // session.snipe_gas_delta = defaultConfig.snipe_gas_delta
	session.snipe_antirug = defaultConfig.snipe_antirug
	session.snipe_antimev = defaultConfig.snipe_antimev
  // session.snipe_max_gas_price = defaultConfig.snipe_max_gas_price
  // session.snipe_max_gas_limit = defaultConfig.snipe_max_gas_limit
	session.snipe_auto = defaultConfig.snipe_auto
	session.snipe_manual = defaultConfig.snipe_manual
	session.snipe_max_mc = defaultConfig.snipe_max_mc
	session.snipe_min_mc = defaultConfig.snipe_min_mc
	session.snipe_min_liq = defaultConfig.snipe_min_liq
	session.snipe_max_liq = defaultConfig.snipe_max_liq
	session.snipe_max_buy_tax = defaultConfig.snipe_max_buy_tax
	session.snipe_max_sell_tax = defaultConfig.snipe_max_sell_tax
	session.trade_autobuy = defaultConfig.trade_autobuy
	session.trade_autobuy_amount = defaultConfig.trade_autobuy_amount
	session.trade_buy_gas_delta = defaultConfig.trade_buy_gas_delta
	session.trade_sell_gas_delta = defaultConfig.trade_sell_gas_delta
	session.trade_autosell = defaultConfig.trade_autosell
	session.trade_autosell_hi = defaultConfig.trade_autosell_hi
	session.trade_autosell_lo = defaultConfig.trade_autosell_lo
	session.trade_autosell_hi_amount = defaultConfig.trade_autosell_hi_amount
	session.trade_autosell_lo_amount = defaultConfig.trade_autosell_lo_amount
	session.simulation_invest_amount = defaultConfig.simulation_invest_amount
	session.simulation_profit_target = defaultConfig.simulation_profit_target
	session.simulation_trailing_stop_loss = defaultConfig.simulation_trailing_stop_loss
  //================RJM================
  session.limit_order_token_addr = 0x0;
  session.limit_order_hi_enabled = defaultConfig.limit_order_hi_enabled;
  session.limit_order_lo_enabled = defaultConfig.limit_order_lo_enabled;
  session.limit_order_hi = defaultConfig.limit_order_hi;
  session.limit_order_lo = defaultConfig.limit_order_lo;
  session.limit_order_hi_amount = defaultConfig.limit_order_hi_amount;
  session.limit_order_lo_amount = defaultConfig.limit_order_lo_amount;
  
  session.quick_pasted_contract_buy = defaultConfig.quick_pasted_contract_buy, //Immediately buy pasted contract.
  session.quick_pasted_contract_buy_amt = defaultConfig.quick_pasted_contract_buy_amt, //Pasted Contract Buy Amount.
  //===================================
	session.referred_by = defaultConfig.referred_by
	session.reward_wallet = defaultConfig.reward_wallet
	session.referral_code = utils.generateReferralCode(session.chatid)

	const timeNow = new Date().getTime()
	session.simulation_start_date = timeNow - (30 * 24 * 3600 * 1000)
	session.simulation_end_date = timeNow
}

export let _command_proc = null
export let _callback_proc = null
export async function init(command_proc, callback_proc) {

	_command_proc = command_proc
	_callback_proc = callback_proc

	await database.init()
	const users = await database.selectUsers()

	let loggedin = 0
	let vips = 0
	for (const user of users) {

		let session = JSON.parse(JSON.stringify(user))
		session = utils.objectDeepCopy(session, ['_id', '__v'])

		if (session.wallet) {
			loggedin++
		}

		sessions.set(session.chatid, session)
		//showSessionLog(session)

		if (session.vip === 1) {
			console.log(`@${session.username} user joined as VIP ( ${session.chatid} )`)
			vips++
		}
	}

	console.log(`${users.length} users, ${loggedin} logged in, ${vips} vips`)
}

bot.on('message', async (message) => {

	// console.log(`========== message ==========`)
	// console.log(message)
	// console.log(`=============================`)

	const msgType = message?.chat?.type;
	if (msgType === 'private') {
		privateBot.procMessage(message, database);

	} else if (msgType === 'group' || msgType === 'supergroup') {

	} else if (msgType === 'channel') {

	}
})

bot.on('callback_query', async (callbackQuery) => {
	// console.log('========== callback query ==========')
	// console.log(callbackQuery)
	// console.log('====================================')

	const message = callbackQuery.message;

	if (!message) {
		return
	}

	const option = JSON.parse(callbackQuery.data);
	let chatid = message.chat.id.toString();

	const cmd = option.c;
	const id = option.k;

	executeCommand(chatid, message.message_id, callbackQuery.id, option)
})

export const reloadCommand = async (chatid, messageId, callbackQueryId, option) => {

	await removeMessage(chatid, messageId)
	executeCommand(chatid, messageId, callbackQueryId, option)
}

export const parsePopupMenu = (id) => {

	const parts = id.split(':')
	let sessionId, popup
	if (parts.length > 1) {

		sessionId = parts[0]
		popup = Number(parts[1])

	} else {

		sessionId = id
		popup = 0
	}

	// console.log('sessionId, popup', sessionId, popup)

	assert(sessionId)

	return { sessionId, popup }
}

export const executeCommand = async (chatid, messageId, callbackQueryId, option) => {

	const cmd = option.c;
	const id = option.k;

	//stateMap_clear();

	try {

		if (cmd === OPTION_MAIN_MENU) {

			const sessionId = id;
			assert(sessionId)

			stateMap_setFocus(chatid, STATE_IDLE, { sessionId })

			const menu = await json_botSettings(sessionId);
			openMenu(chatid, cmd, getMainMenuMessage(), menu.options)

		} else if (cmd === OPTION_MAIN_SNIPE) {

			const { sessionId, popup } = parsePopupMenu(id)

      const session = sessions.get(sessionId);
      if (session) {
        if (session.account === null) {
          executeCommand(chatid, messageId, callbackQueryId, {c: OPTION_SNIPE_WALLET_PANEL, k: sessionId,});
          return;
        }
      }
			const menu = await json_setSnipeOption(sessionId);
			if (popup)
				await openMenu(chatid, cmd, await getSnipeOptionMsg(sessionId), menu.options)
			else
				await switchMenu(chatid, messageId, await getSnipeOptionMsg(sessionId), menu.options)

		} else if (cmd === OPTION_MAIN_SCANNER) {

			const { sessionId, popup } = parsePopupMenu(id)
			const menu = await json_setScannerOption(sessionId);
			if (popup)
				await openMenu(chatid, cmd, await getScannerOptionMsg(sessionId), menu.options)
			else
				await switchMenu(chatid, messageId, await getScannerOptionMsg(sessionId), menu.options)

		} else if (cmd === OPTION_MAIN_TRADE) {

			const { sessionId, popup } = parsePopupMenu(id)
      const session = sessions.get(sessionId);
      if (session) {
        if (session.account === null) {
          executeCommand(chatid, messageId, callbackQueryId, {c: OPTION_SNIPE_WALLET_PANEL, k: sessionId,});
          return;
        }
      }
			const menu = await json_setTradeOption(sessionId);
			if (popup)
				await openMenu(chatid, cmd, await getTradeOptionMsg(sessionId), menu.options)
			else
				await switchMenu(chatid, messageId, await getTradeOptionMsg(sessionId), menu.options)

		} else if (cmd === OPTION_MAIN_WALLETS) {

			const { sessionId, popup } = parsePopupMenu(id)
			const menu = await json_setWallet(sessionId);
			if (popup)
				await openMenu(chatid, cmd, await getWalletOptionMsg(sessionId), menu.options)
			else
				await switchMenu(chatid, messageId, await getWalletOptionMsg(sessionId), menu.options)

		} else if (cmd === OPTION_MAIN_MANUAL) {

			const sessionId = id;
			assert(sessionId)

			const menu = await json_manual(sessionId);
			await openMenu(chatid, cmd, await getManualMessage(), menu.options)

		} else if (cmd === OPTION_SIMULATION) {

			const { sessionId, popup } = parsePopupMenu(id)

			const session = sessions.get(sessionId)
			if (session) {

				const menu = await json_simulation(sessionId);
				if (popup) {
					await openMenu(chatid, cmd, await getSimulationOptionMsg(sessionId), menu.options)
				} else {
					await switchMenu(chatid, messageId, await getSimulationOptionMsg(sessionId), menu.options)
				}
			}

		} else if (cmd === OPTION_MAIN_REFERRAL) {

			const { sessionId, popup } = parsePopupMenu(id)

			const session = sessions.get(sessionId)
			if (session) {

				const menu = await json_referral(sessionId);
				if (popup) {
					await openMenu(chatid, cmd, await getReferralOptionMsg(sessionId), menu.options)
				} else {
					await switchMenu(chatid, messageId, await getReferralOptionMsg(sessionId), menu.options)
				}
			}

		} else if (cmd === OPTION_SWAP_BOT) {

			const { sessionId, popup } = parsePopupMenu(id)

			let session = sessions.get(sessionId)
			if (session) {
				const menu = await json_swap(sessionId);
				if (menu) {
					if (popup) {
						await openMenu(chatid, cmd, await getWalletOptionMsg(session.chatid), menu.options)
					} else {
						await switchMenu(chatid, messageId, await getWalletOptionMsg(session.chatid), menu.options)
					}
				}
      }
    } else if (cmd === OPTION_SNIPE_WALLET_PANEL) {
      const sessionId = id;
      assert(sessionId);

      const menu = json_snipeWalletPanel(sessionId);
      if (menu) {
        await openMenu(chatid, messageId, menu.title, menu.options);
      }
		} else if (cmd === OPTION_SET_SCANNER_INIT_LIQUIDITY) {

			const sessionId = id;
			assert(sessionId)

			const menu = await json_setInitLiquidity(sessionId);
			if (menu)
				openMenu(chatid, cmd, get_menuTitle(sessionId, menu.title), menu.options)

		} else if (cmd === OPTION_SET_INIT_LIQUIDITY_ETH) {

			const sessionId = id;
			assert(sessionId)

			const msg = `Input min ${afx.get_chain_symbol()} balance of initial liquidity`
			sendReplyMessage(chatid, msg)

			stateMap_setFocus(chatid, STATE_WAIT_INIT_ETH, { sessionId, messageId })

		} else if (cmd === OPTION_SET_INIT_LIQUIDITY_USD) {

			const sessionId = id;
			assert(sessionId)

			const msg = `Input min USDT or USDC balance of initial liquidity`
			sendReplyMessage(chatid, msg)

			stateMap_setFocus(chatid, STATE_WAIT_INIT_USDT_USDC, { sessionId, messageId })

		} else if (cmd === OPTION_SET_SCANNER_FRESH_WALLET) {

			const sessionId = id;
			assert(sessionId)

			const menu = await json_setFresh(sessionId);
			if (menu) {
				openMenu(chatid, cmd, get_menuTitle(sessionId, menu.title), menu.options)
			}

		} else if (cmd === OPTION_SET_FRESH_WALLET_TURN_ON) {

			const sessionId = id;
			assert(sessionId)

			sendReplyMessage(chatid, 'Reply to this message with max fresh transaction count')

			stateMap_setFocus(chatid, STATE_WAIT_FRESH_WALLET_MAX_TRANSACTION_COUNT, { sessionId, messageId })

		} else if (cmd === OPTION_SET_FRESH_WALLET_TURN_OFF) {

			const sessionId = id;
			assert(sessionId)

			let session = sessions.get(sessionId)
			if (session) {

				// session.max_fresh_transaction_count = 0
				session.min_fresh_wallet_count = 0

				await database.updateUser(session)

				sendInfoMessage(chatid, `✅ Fresh wallet filter has been turned off`)

				reloadCommand(chatid, messageId, callbackQueryId, { c: OPTION_SET_SCANNER_FRESH_WALLET, k: sessionId })
			}

		} else if (cmd === OPTION_SET_SCANNER_WHALE_WALLET) {

			const sessionId = id;
			assert(sessionId)

			const menu = await json_setWhale(sessionId);
			if (menu) {
				openMenu(chatid, cmd, get_menuTitle(sessionId, menu.title), menu.options)
			}

		} else if (cmd === OPTION_SET_WHALE_WALLET_TURN_ON) {

			const sessionId = id;
			assert(sessionId)

			sendReplyMessage(chatid, 'Reply to this message with whale wallet min balance')

			stateMap_setFocus(chatid, STATE_WAIT_WHALE_WALLET_MIN_BALANCE, { sessionId, messageId })

		} else if (cmd === OPTION_SET_WHALE_WALLET_TURN_OFF) {

			const sessionId = id;
			assert(sessionId)

			let session = sessions.get(sessionId)
			if (session) {

				session.min_whale_balance = 0
				session.min_whale_wallet_count = 0

				await database.updateUser(session)

				sendInfoMessage(chatid, `✅ Whale wallet filter has been turned off`)

				reloadCommand(chatid, messageId, callbackQueryId, { c: OPTION_SET_SCANNER_WHALE_WALLET, k: sessionId })
			}

		} else if (cmd === OPTION_SET_SCANNER_KYC_WALLET) {

			const sessionId = id;
			assert(sessionId)

			const menu = await json_setKyc(sessionId);
			if (menu)
				openMenu(chatid, cmd, get_menuTitle(sessionId, menu.title), menu.options)

		} else if (cmd === OPTION_SET_KYC_WALLET_TURN_ON) {

			const sessionId = id;
			assert(sessionId)

			sendReplyMessage(chatid, 'Kindly min KYC wallet count')

			stateMap_setFocus(chatid, STATE_WAIT_MIN_KYC_WALLET_COUNT, { sessionId, messageId })

		} else if (cmd === OPTION_SET_KYC_WALLET_TURN_OFF) {

			const sessionId = id;
			assert(sessionId)

			let session = sessions.get(sessionId)
			if (session) {

				session.min_kyc_wallet_count = 0

				await database.updateUser(session)

				sendInfoMessage(chatid, `✅ KYC wallet filter has been turned off`)

				reloadCommand(chatid, messageId, callbackQueryId, { c: OPTION_SET_SCANNER_KYC_WALLET, k: sessionId })
			}

		} else if (cmd === OPTION_SET_SCANNER_RESET) {

			const sessionId = id;
			assert(sessionId)

			const msg = `Please enter 'Yes' to make sure you want to reset scanner setting. (Yes for set to default, otherwise, cancel default set)`
			sendReplyMessage(chatid, msg)

			stateMap_setFocus(chatid, STATE_WAIT_SET_SCANNER_RESET, { sessionId, messageId })

		} else if (cmd === OPTION_SET_SCANNER_ALL_OFF) {

			const sessionId = id;
			assert(sessionId)

			const msg = `Please enter 'Yes' to make sure you want to turn off all setting. (Yes for set to turn off all, otherwise, cancel turn off set)`
			sendReplyMessage(chatid, msg)

			stateMap_setFocus(chatid, STATE_WAIT_SET_SCANNER_ALL_OFF, { sessionId, messageId })

		} else if (cmd === OPTION_SET_SCANNER_LPLOCK) {

			const sessionId = id;
			assert(sessionId)

			const menu = await json_setLPLock(sessionId);
			if (menu) {
				openMenu(chatid, cmd, get_menuTitle(sessionId, menu.title), menu.options)
			}

		} else if (cmd === OPTION_SET_SCANNER_LPLOCK_TURN_ON || cmd === OPTION_SET_SCANNER_LPLOCK_TURN_OFF) {

			const sessionId = id;
			assert(sessionId)

			let session = sessions.get(sessionId)
			if (session) {

				if (cmd === OPTION_SET_SCANNER_LPLOCK_TURN_ON) {
					session.lp_lock = 1
				} else {
					session.lp_lock = 0
				}

				await database.updateUser(session)

				if (session.lp_lock) {
					sendInfoMessage(chatid, `✅ LP lock filter has been turned on. You will receive the call which indicates [LPLock = Yes]`)

				} else {
					sendInfoMessage(chatid, `✅ LP lock filter has been turned off`)
				}

				const menu = await json_setLPLock(sessionId);
				if (menu) {
					switchMenu(chatid, messageId, get_menuTitle(sessionId, menu.title), menu.options)
				}
			}
		} else if (cmd === OPTION_SET_SCANNER_HONEYPOT) {

			const sessionId = id;
			assert(sessionId)

			const menu = await json_setHoneypot(sessionId);
			if (menu) {
				openMenu(chatid, cmd, get_menuTitle(sessionId, menu.title), menu.options)
			}

		} else if (cmd === OPTION_SET_HONEYPOT_TURN_ON || cmd === OPTION_SET_HONEYPOT_TURN_OFF) {

			const sessionId = id;
			assert(sessionId)

			let session = sessions.get(sessionId)
			if (session) {

				if (cmd === OPTION_SET_HONEYPOT_TURN_ON) {
					session.honeypot = 1
				} else {
					session.honeypot = 0
				}

				await database.updateUser(session)

				if (session.honeypot) {
					sendInfoMessage(chatid, `✅ Honeypot filter has been turned on. You will receive the call which indicates [Honeypot = No]`)

				} else {
					sendInfoMessage(chatid, `✅ LP lock filter has been turned off`)
				}

				const menu = await json_setHoneypot(sessionId);
				if (menu) {
					switchMenu(chatid, messageId, get_menuTitle(sessionId, menu.title), menu.options)
				}
			}

		} else if (cmd === OPTION_SET_SCANNER_CONTRACT_AGE) {

			const sessionId = id;
			assert(sessionId)

			const menu = await json_setContractAge(sessionId);

			if (menu) {
				openMenu(chatid, cmd, get_menuTitle(sessionId, menu.title), menu.options)
			}

		} else if (cmd === OPTION_SET_CONTRACT_AGE_PLUS0_1DAY || cmd === OPTION_SET_CONTRACT_AGE_PLUS1DAY || cmd === OPTION_SET_CONTRACT_AGE_PLUS1MONTH || cmd === OPTION_SET_CONTRACT_AGE_PLUS1YEAR || cmd === OPTION_SET_CONTRACT_AGE_TURN_OFF) {

			const sessionId = id;
			assert(sessionId)

			let session = sessions.get(sessionId)
			if (session) {

				if (cmd === OPTION_SET_CONTRACT_AGE_PLUS0_1DAY) {

					session.contract_age = 0.1

				} else if (cmd === OPTION_SET_CONTRACT_AGE_PLUS1DAY) {

					session.contract_age = 1

				} else if (cmd === OPTION_SET_CONTRACT_AGE_PLUS1MONTH) {

					session.contract_age = 30

				} else if (cmd === OPTION_SET_CONTRACT_AGE_PLUS1YEAR) {

					session.contract_age = 365

				} else {

					session.contract_age = 0
				}

				await database.updateUser(session)

				if (session.contract_age !== 0) {
					sendInfoMessage(chatid, `✅ Contract Age filter has been turned on [${session.contract_age}+ days]`)

				} else {
					sendInfoMessage(chatid, `✅ Contract Age filter has been turned off`)
				}

				const menu = await json_setContractAge(sessionId);
				if (menu) {
					switchMenu(chatid, messageId, get_menuTitle(sessionId, menu.title), menu.options)
				}
			}

		} else if (cmd === OPTION_SET_CONTRACT_AGE_PLUSNUMBERDAYS) {

			const sessionId = id;
			assert(sessionId)

			const msg = `Reply to this message with minimum contract age`
			sendReplyMessage(chatid, msg)
			stateMap_setFocus(chatid, STATE_WAIT_MIN_CONTRACT_AGE, { sessionId, messageId })

		} else if (cmd === OPTION_MSG_COPY_ADDRESS) {

			const tokenAddress = id;
			assert(tokenAddress)
			let msg = '```' + tokenAddress + '```'
			bot.sendMessage(chatid, msg, { parse_mode: 'Markdown' })

		} else if (cmd === OPTION_MSG_MORE_INFO || cmd === OPTION_MSG_BACK_INFO) {

			const parts = id.split(':')
			assert(parts.length == 2)
			const sessionId = parts[0]
			const hashCode = parts[1]
			assert(sessionId)
			assert(hashCode)

			// dataHistory.readMsgData(sessionId, hashCode).then((json) => {

			// 	if (json) {
			// 		let menu = null

			// 		if (cmd === OPTION_MSG_MORE_INFO) {
			// 			menu = json_msgOption(json.chatid, json.tokenAddress, json.poolAddress, json.poolId, false)

			// 			const updateText = json.data?.content1 + json.data?.tag
			// 			editAnimationMessageCaption(json.chatid, messageId, updateText, menu.options)

			// 		} else {
			// 			menu = json_msgOption(json.chatid, json.tokenAddress, json.poolAddress, json.poolId, true)

			// 			const updateText = json.data?.content0 + json.data?.tag
			// 			editAnimationMessageCaption(json.chatid, messageId, updateText, menu.options)
			// 		}
			// 	} else {
			// 		// bot.answerCallbackQuery(callbackQueryId, { text: `Unable to access the 'More Info' page for old messages` })
			// 	}
			// })

		} else if (
			cmd === OPTION_MSG_BUY_ETH_0_01 ||
			cmd === OPTION_MSG_BUY_ETH_0_05 ||
			cmd === OPTION_MSG_BUY_ETH_0_1 ||
			cmd === OPTION_MSG_BUY_ETH_0_2 ||
			cmd === OPTION_MSG_BUY_ETH_0_5 ||
			cmd === OPTION_MSG_BUY_ETH_1
		) {

			const parts = id.split(':')
			assert(parts.length == 2)
			const sessionId = parts[0]
			const poolId = parseInt(parts[1])
			assert(sessionId)
			assert(poolId)

			if (1) {

				let session = sessions.get(sessionId)

				let ethAmountMap = new Map()

				ethAmountMap.set(OPTION_MSG_BUY_ETH_0_01, 0.01)
				ethAmountMap.set(OPTION_MSG_BUY_ETH_0_05, 0.05)
				ethAmountMap.set(OPTION_MSG_BUY_ETH_0_1, 0.1)
				ethAmountMap.set(OPTION_MSG_BUY_ETH_0_2, 0.2)
				ethAmountMap.set(OPTION_MSG_BUY_ETH_0_5, 0.5)
				ethAmountMap.set(OPTION_MSG_BUY_ETH_1, 1.0)

				let ethAmount = ethAmountMap.get(cmd)

				if (session) {

					if (!session.pkey) {
						bot.answerCallbackQuery(callbackQueryId, { text: `Please add your wallet in the setting and then try again` })
						return
					}

					let poolHistoryInfo = await getAddrInfoFromPoolId(poolId)

					if (poolHistoryInfo) {
						let tokenAddress = poolHistoryInfo.token_address
						let version = poolHistoryInfo.version

						if (_callback_proc) {
							_callback_proc(cmd, { session, tokenAddress, ethAmount, version })
						}
					}
				}

			} else {
				bot.answerCallbackQuery(callbackQueryId, { text: `Currently only dev can access this menu. Coming soon!` })
			}

		} else if (cmd === OPTION_MSG_BUY_ETH_X) {

			const parts = id.split(':')
			assert(parts.length == 2)
			const sessionId = parts[0]
			const poolId = parseInt(parts[1])
			assert(sessionId)
			assert(poolId)

			let session = sessions.get(sessionId)
			if (session) {
				if (!session.pkey) {
					bot.answerCallbackQuery(callbackQueryId, { text: `Please add your wallet in the setting and then try again.` })
					const msg = `Please add your wallet in the setting and then try again.`
					sendMessage(chatid, msg)
					return
				}

				const msg = `Reply to this message with the ${afx.get_chain_symbol()} amount to buy token`
				sendReplyMessage(chatid, msg)
				stateMap_setFocus(chatid, STATE_WAIT_SET_ETH_X_BUY, { sessionId, poolId, messageId })
			}

		} else if (cmd === OPTION_MSG_BUY_TOKEN_X) {

			const parts = id.split(':')
			assert(parts.length == 2)
			const sessionId = parts[0]
			const poolId = parseInt(parts[1])
			assert(sessionId)
			assert(poolId)

			let session = sessions.get(sessionId)
			if (session) {
				if (!session.pkey) {
					bot.answerCallbackQuery(callbackQueryId, { text: `Please add your wallet in the setting and then try again.` })
					const msg = `Please add your wallet in the setting and then try again.`
					sendMessage(chatid, msg)
					return
				}

				const msg = `Reply to this message with the token amount to buy`
				sendReplyMessage(chatid, msg)
				stateMap_setFocus(chatid, STATE_WAIT_SET_TOKEN_X_BUY, { sessionId, poolId, messageId })
			}

		} else if (cmd === OPTION_MSG_SELL_PERCENT_X
			|| cmd === OPTION_PANEL_SELL_PERCENT_X) {

			const parts = id.split(':')
			assert(parts.length == 2)
			const sessionId = parts[0]
			const poolId = parseInt(parts[1])
			assert(sessionId)
			assert(poolId)

			let session = sessions.get(sessionId)
			if (session) {
				if (!session.pkey) {
					bot.answerCallbackQuery(callbackQueryId, { text: `Please add your wallet in the setting and then try again.` })
					const msg = `Please add your wallet in the setting and then try again.`
					sendMessage(chatid, msg)
					return
				}

				const msg = `Reply to this message with the percentage value at which you would like to sell the token.`
				sendReplyMessage(chatid, msg)
				stateMap_setFocus(chatid, STATE_WAIT_SET_PERCENT_X_SELL, { sessionId, poolId, messageId, cmd })
			}

		} else if (cmd === OPTION_MSG_SELL_TOKEN_X
			|| cmd === OPTION_PANEL_SELL_TOKEN_X) {

			const parts = id.split(':')
			assert(parts.length == 2)
			const sessionId = parts[0]
			const poolId = parseInt(parts[1])
			assert(sessionId)
			assert(poolId)

			let session = sessions.get(sessionId)
			if (session) {
				if (!session.pkey) {
					bot.answerCallbackQuery(callbackQueryId, { text: `Please add your wallet in the setting and then try again.` })
					const msg = `Please add your wallet in the setting and then try again.`
					sendMessage(chatid, msg)
					return
				}

				const msg = `Reply to this message with the token amount at which you would like to sell the token.`
				sendReplyMessage(chatid, msg)
				stateMap_setFocus(chatid, STATE_WAIT_SET_TOKEN_X_SELL, { sessionId, poolId, messageId })
			}

		} else if (
			cmd === OPTION_MSG_SELL_PERCENT_25 ||
			cmd === OPTION_MSG_SELL_PERCENT_50 ||
			cmd === OPTION_MSG_SELL_PERCENT_75 ||
			cmd === OPTION_MSG_SELL_PERCENT_100 ||
			cmd === OPTION_PANEL_SELL_PERCENT_25 ||
			cmd === OPTION_PANEL_SELL_PERCENT_50 ||
			cmd === OPTION_PANEL_SELL_PERCENT_75 ||
			cmd === OPTION_PANEL_SELL_PERCENT_100
		) {

			const parts = id.split(':')
			assert(parts.length == 2)
			const sessionId = parts[0]
			const poolId = parseInt(parts[1])
			assert(sessionId)
			assert(poolId)

			if (1) {

				let session = sessions.get(sessionId)

				let ethAmountMap = new Map()

				ethAmountMap.set(OPTION_MSG_SELL_PERCENT_25, 25)
				ethAmountMap.set(OPTION_MSG_SELL_PERCENT_50, 50)
				ethAmountMap.set(OPTION_MSG_SELL_PERCENT_75, 75)
				ethAmountMap.set(OPTION_MSG_SELL_PERCENT_100, 100)

				ethAmountMap.set(OPTION_PANEL_SELL_PERCENT_25, 25)
				ethAmountMap.set(OPTION_PANEL_SELL_PERCENT_50, 50)
				ethAmountMap.set(OPTION_PANEL_SELL_PERCENT_75, 75)
				ethAmountMap.set(OPTION_PANEL_SELL_PERCENT_100, 100)

				let isPanel = false

				if (cmd === OPTION_PANEL_SELL_PERCENT_25 ||
					cmd === OPTION_PANEL_SELL_PERCENT_50 ||
					cmd === OPTION_PANEL_SELL_PERCENT_75 ||
					cmd === OPTION_PANEL_SELL_PERCENT_100) {
					isPanel = true
				}

				let ethAmount = ethAmountMap.get(cmd)

				if (session) {

					if (!session.pkey) {
						bot.answerCallbackQuery(callbackQueryId, { text: `Please add your wallet in the setting and then try again` })
						return
					}

					let poolHistoryInfo = null

					if (isPanel) {
						// poolHistoryInfo = await database.selectPanelHistory({ panel_id: poolId })
						poolHistoryInfo = await database.selectTokenPanelHistory({ token_id: poolId })
					} else {
						poolHistoryInfo = await getAddrInfoFromPoolId(poolId)
					}


					if (poolHistoryInfo) {
						let tokenAddress = poolHistoryInfo.token_address
						let version = poolHistoryInfo.version

						if (_callback_proc) {
							_callback_proc(cmd, { session, tokenAddress, ethAmount, version })
						}
					}
				}

			} else {
				bot.answerCallbackQuery(callbackQueryId, { text: `Currently only dev can access this menu. Coming soon!` })
			}

		} else if (cmd === OPTION_MSG_SNIPE) {

			const parts = id.split(':')
			assert(parts.length == 2)
			const sessionId = parts[0]
			const poolId = parseInt(parts[1])
			assert(sessionId)
			assert(poolId)

			let session = sessions.get(sessionId)
			if (session) {
				if (!session.pkey) {
					bot.answerCallbackQuery(callbackQueryId, { text: `Please add your wallet in the setting and then try again.` })
					const msg = `Please add your wallet in the setting and then try again.`
					sendMessage(chatid, msg)
					return
				}

				const msg = `Reply to this message with the ${afx.get_chain_symbol()} amount to snipe`
				sendReplyMessage(chatid, msg)
				stateMap_setFocus(chatid, STATE_WAIT_SET_SNIPE, { sessionId, poolId, messageId })
			}

		} else if (cmd === OPTION_SET_SNIPER_DETECTOR) {

			const sessionId = id;
			assert(sessionId)

			const menu = await json_setSniperDetector(sessionId);
			if (menu) {
				switchMenu(chatid, messageId, get_menuTitle(sessionId, menu.title), menu.options)
			}

		} else if (cmd === OPTION_SET_SNIPER_DETECTOR_TURN_OFF) {

			const sessionId = id;
			assert(sessionId)

			let session = sessions.get(sessionId)
			if (session) {

				session.min_sniper_count = 0
				await database.updateUser(session)
				sendInfoMessage(chatid, `✅ Sniper detector has been turned off`)

				const menu = await json_setSniperDetector(sessionId);
				if (menu) {
					switchMenu(chatid, messageId, get_menuTitle(sessionId, menu.title), menu.options)
				}
			}

		} else if (cmd === OPTION_SET_SNIPER_DETECTOR_TURN_ON) {

			const sessionId = id;
			assert(sessionId)

			const msg = `Reply to this message with minimum sniper buys to be detected`
			sendReplyMessage(chatid, msg)
			stateMap_setFocus(chatid, STATE_WAIT_MIN_SNIPER_COUNT, { sessionId, messageId })

		} else if (cmd === OPTION_SET_WALLETS_CONNECT) {

			const sessionId = id;
			assert(sessionId)

			const msg = `Reply to this message with your wallet private key or mnemonic phrase`
			sendReplyMessage(chatid, msg)
			stateMap_setFocus(chatid, STATE_WAIT_SET_WALLETS_PRIVATEKEY, { sessionId, messageId })

		} else if (cmd === OPTION_SET_SNIPE_SLIPPAGE) {

			const sessionId = id;
			assert(sessionId)

			const msg = `Reply to this message with your desired slippage percentage. Minimum is 0.1%. Max is 100%`
			sendReplyMessage(chatid, msg)
			stateMap_setFocus(chatid, STATE_WAIT_SET_SNIPE_SLIPPAGE, { sessionId, messageId })

		} else if (cmd === OPTION_SET_SNIPE_MAX_GAS_PRICE) {

			const sessionId = id;
			assert(sessionId)

			const msg = `Reply to this message with your desired maximum gas price (in gwei). 1 gwei = 10 ^ 9 wei. Minimum is ${afx.get_min_gas_price()} gwei`
			sendReplyMessage(chatid, msg)
			stateMap_setFocus(chatid, STATE_WAIT_SET_SNIPE_MAX_GAS_PRICE, { sessionId, messageId })

		} else if (cmd === OPTION_SET_SNIPE_MAX_GAS_LIMIT) {

			const sessionId = id;
			assert(sessionId)

			const msg = `Reply to this message with your desired maximum gas limit. Minimum is ${afx.get_min_gas_limit()}`
			sendReplyMessage(chatid, msg)
			stateMap_setFocus(chatid, STATE_WAIT_SET_SNIPE_MAX_GAS_LIMIT, { sessionId, messageId })

		} else if (cmd === OPTION_SET_SNIPE_AUTO_AMOUNT) {

			const sessionId = id;
			assert(sessionId)

			const msg = `Reply to this message with your desired ${afx.get_chain_symbol()} amount to snipe in auto mode`
			sendReplyMessage(chatid, msg)
			stateMap_setFocus(chatid, STATE_WAIT_SET_SNIPE_AUTO_AMOUNT, { sessionId, messageId })

		} else if (cmd === OPTION_SET_SNIPE_MAX_MC) {

			const sessionId = id;
			assert(sessionId)

			const msg = `Reply to this message with your desired market cap threshold in USD. Minimum is $1!

⚠️ If the token's market cap is higher than your set amount, auto buy will not be triggered.`

			sendReplyMessage(chatid, msg)
			stateMap_setFocus(chatid, STATE_WAIT_SET_SNIPE_MAX_MC, { sessionId, messageId })

		} else if (cmd === OPTION_SET_SNIPE_MIN_MC) {

			const sessionId = id;
			assert(sessionId)

			const msg = `Reply to this message with your desired market cap threshold in USD. Minimum is $1!

⚠️ If the token's market cap is lower than your set amount, auto buy will not be triggered.`

			sendReplyMessage(chatid, msg)
			stateMap_setFocus(chatid, STATE_WAIT_SET_SNIPE_MIN_MC, { sessionId, messageId })

		} else if (cmd === OPTION_SET_SNIPE_MIN_LIQ) {

			const sessionId = id;
			assert(sessionId)

			const msg = `Reply to this message with your desired minimum liquidity threshold in USD. Make sure this is lower than your max threshold!

⚠️ If the token's liquidity is lower than your set amount, auto buy will not be triggered.`

			sendReplyMessage(chatid, msg)
			stateMap_setFocus(chatid, STATE_WAIT_SET_SNIPE_MIN_LIQ, { sessionId, messageId })

		} else if (cmd === OPTION_SET_SNIPE_MAX_LIQ) {

			const sessionId = id;
			assert(sessionId)

			const msg = `Reply to this message with your desired maximum liquidity threshold in USD. Make sure this is higher than your min threshold!

⚠️ If the token's liquidity is higher than your set amount, auto buy will not be triggered.`

			sendReplyMessage(chatid, msg)
			stateMap_setFocus(chatid, STATE_WAIT_SET_SNIPE_MAX_LIQ, { sessionId, messageId })

		} else if (cmd === OPTION_SET_SNIPE_MAX_BUY_TAX) {

			const sessionId = id;
			assert(sessionId)

			const msg = `Reply to this message with your desired buy tax threshold!

⚠️ If the token's buy tax is higher than your set amount, auto buy will not be triggered.`

			sendReplyMessage(chatid, msg)
			stateMap_setFocus(chatid, STATE_WAIT_SET_SNIPE_MAX_BUY_TAX, { sessionId, messageId })

		} else if (cmd === OPTION_SET_SNIPE_MAX_SELL_TAX) {

			const sessionId = id;
			assert(sessionId)

			const msg = `Reply to this message with your desired sell tax threshold!

⚠️ If the token's sell tax is higher than your set amount, auto buy will not be triggered.`

			sendReplyMessage(chatid, msg)
			stateMap_setFocus(chatid, STATE_WAIT_SET_SNIPE_MAX_SELL_TAX, { sessionId, messageId })
    } else if (cmd === OPTION_SET_SNIPE_AUTO) {
      const parts = id.split(":");
      assert(parts.length == 2);
      const sessionId = parts[0];
      const jsonId = parseInt(parts[1]);
      assert(sessionId);
      assert(jsonId);

      let session = sessions.get(sessionId);
      // console.log("Auto Snipe Setting Session:", session)
      if (session) {
        session.snipe_auto = session.snipe_auto ? 0 : 1;
        await database.updateUser(session);
        if (jsonId == 1) {
          executeCommand(chatid, messageId, callbackQueryId, {c: OPTION_MAIN_SNIPE, k: sessionId,});  
        } else if (jsonId == 2) {            
          const menu = await json_quickSettings(session.chatid);
          if (menu)
            switchMenu(chatid, messageId, await getQuickSetting(session), menu.options);
        }
      }
    } else if (cmd === OPTION_SET_SNIPE_MANUAL) {
      	const sessionId = id;
     	assert(sessionId);

		let session = sessions.get(sessionId)
		if (session) {
			session.snipe_manual = session.snipe_manual ? 0 : 1
			await database.updateUser(session)

			executeCommand(chatid, messageId, callbackQueryId, { c: OPTION_MAIN_SNIPE, k: sessionId })
		}

	} else if (cmd === OPTION_SET_SNIPE_USE_AUTOSELL) {

		const sessionId = id;
		assert(sessionId)

		let session = sessions.get(sessionId)
		if (session) {

			session.snipe_use_autosell = session.snipe_use_autosell ? 0 : 1
			await database.updateUser(session)

			executeCommand(chatid, messageId, callbackQueryId, { c: OPTION_MAIN_SNIPE, k: sessionId })
		}

	} else if (cmd === OPTION_SET_SNIPE_ANTIRUG) {

			const sessionId = id;
			assert(sessionId)

			let session = sessions.get(sessionId)
			if (session) {

				session.snipe_antirug = session.snipe_antirug ? 0 : 1
				await database.updateUser(session)

				executeCommand(chatid, messageId, callbackQueryId, { c: OPTION_MAIN_SNIPE, k: sessionId })
			}

	} else if (cmd === OPTION_SET_SNIPE_ANTIMEV) {
		const parts = id.split(":");
		console.log("parts", parts)
		assert(parts.length == 2);
		const sessionId = parts[0];
		const jsonId = parseInt(parts[1]);
		assert(sessionId);
		assert(jsonId);

		let session = sessions.get(sessionId);
		if (session) {
		session.snipe_antimev = session.snipe_antimev ? 0 : 1;
		await database.updateUser(session);
		if (jsonId == 1) {
			executeCommand(chatid, messageId, callbackQueryId, {c: OPTION_MAIN_SNIPE, k: sessionId,});
		} else if (jsonId == 2) {
			const menu = await json_quickSettings(session.chatid);
			if (menu)
			await switchMenu(chatid, messageId, await getQuickSetting(session), menu.options);
		}
		}
    } else if (cmd === OPTION_SET_SNIPE_GAS_DELTA) {
      const sessionId = id;
      assert(sessionId);

			const msg = `Reply to this message with your desired delta buy gas price (in gwei).

This is a delta value. Example:
AVG gas price = 5 gwei
Delta gas price = 3 gwei
Transaction gas price = 5 + 3 = 8 gwei`

			sendReplyMessage(chatid, msg)
			stateMap_setFocus(chatid, STATE_WAIT_SET_SNIPE_GAS_DELTA, { sessionId, messageId })

	} else if (cmd === OPTION_SET_WALLETS_GENERATE) {

		const sessionId = id;
		assert(sessionId)

		const session = sessions.get(sessionId)
		executeCommand(chatid, messageId, callbackQueryId, {c: OPTION_CLOSE, k: sessionId,}); //RJM
		if (session && _callback_proc) {
			await _callback_proc(cmd, { session })

			const menu = await json_setWallet(sessionId);
			if (menu) {
				//==================RJM===================
				// removeMenu(chatid, messageId)
				openMenu(chatid, messageId, await getWalletOptionMsg(sessionId), menu.options);
			}
			// executeCommand(sessionId, null, null, {c:OPTION_MAIN_WALLETS, k:`${sessionId}:1`})
		}

	} else if (cmd === OPTION_SET_WALLETS_ACCOUNT_1) {

		const sessionId = id;
		assert(sessionId)

		let session = sessions.get(sessionId)
		if (session) {
			session.wallets_index = 0;
			let pkey = session.wallets[session.wallets_index].pkey;
			if (!pkey) {
				await _callback_proc(OPTION_SET_WALLETS_GENERATE, { session })
				const menu = await json_setWallet(sessionId);
				if (menu) {
					switchMenu(chatid, messageId, await getWalletOptionMsg(sessionId), menu.options)
					return;
				}
			}
			session.pkey = pkey;
			session.account = session.wallets[session.wallets_index].account;
			await database.updateUser(session)
			executeCommand(chatid, messageId, callbackQueryId, { c: OPTION_MAIN_WALLETS, k: sessionId })
		}
	} else if (cmd === OPTION_SET_WALLETS_ACCOUNT_2) {

		const sessionId = id;
		assert(sessionId)

		let session = sessions.get(sessionId)
		if (session) {
			session.wallets_index = 1;
			let pkey = session.wallets[session.wallets_index].pkey;
			if (!pkey) {
				await _callback_proc(OPTION_SET_WALLETS_GENERATE, { session })
				const menu = await json_setWallet(sessionId);
				if (menu) {
					switchMenu(chatid, messageId, await getWalletOptionMsg(sessionId), menu.options)
					return;
				}
			}
			session.pkey = pkey;
			session.account = session.wallets[session.wallets_index].account;
			await database.updateUser(session)
			executeCommand(chatid, messageId, callbackQueryId, { c: OPTION_MAIN_WALLETS, k: sessionId })
		}
	} else if (cmd === OPTION_SET_WALLETS_ACCOUNT_3) {

		const sessionId = id;
		assert(sessionId)

		let session = sessions.get(sessionId)
		if (session) {
			session.wallets_index = 2;
			let pkey = session.wallets[session.wallets_index].pkey;
			if (!pkey) {
				await _callback_proc(OPTION_SET_WALLETS_GENERATE, { session })
				const menu = await json_setWallet(sessionId);
				if (menu) {
					switchMenu(chatid, messageId, await getWalletOptionMsg(sessionId), menu.options)
					return;
				}
			}
			session.pkey = pkey;
			session.account = session.wallets[session.wallets_index].account;
			await database.updateUser(session)
			executeCommand(chatid, messageId, callbackQueryId, { c: OPTION_MAIN_WALLETS, k: sessionId })
		}
	} else if (cmd === OPTION_SET_WALLETS_DISCONNECT) {

		const sessionId = id;
		assert(sessionId)

		const session = sessions.get(sessionId)
		if (session) {
			session.pkey = null
			session.account = null
			await database.updateUser(session)

			//sendMessage(chatid, 'Your wallet has been disconnected')
			await bot.answerCallbackQuery(callbackQueryId, { text: `Your wallet has been disconnected` })
			const menu = await json_setWallet(sessionId);
			if (menu) {
				switchMenu(chatid, messageId, await getWalletOptionMsg(sessionId), menu.options)
			}
		}

	} else if (cmd === OPTION_SET_WALLETS_BALANCE) {

		const sessionId = id;
		assert(sessionId)

		const session = sessions.get(sessionId)
		if (session && utils.web3Inst) {

			if (session.account) {

				console.log(session.account)
				const balanceInfos = await utils.getWalletInfo(utils.web3Inst, session.account, [])

				let log = `Your wallet address: <code>${session.account}</code>
Your balance details:`
				for (const [tokenAddressInfo, balanceInfo] of balanceInfos) {

					const balanceInUSD = balanceInfo.balance * balanceInfo.price
					log += `\n${balanceInfo.balance} ${balanceInfo.symbol} ($ ${utils.roundDecimal(balanceInUSD, 2)})`
				}

				sendMessage(chatid, log)

			} else {

				sendMessage(chatid, 'Your wallet is not currently connected. Please either connect your existing wallet or create a new one.')
			}
		}

	} else if (cmd === OPTION_SET_TRADE_AUTOBUY || cmd === OPTION_SET_QUICK_AUTOBUY) {

		const sessionId = id;
		assert(sessionId)

		const session = sessions.get(sessionId)
		if (session) {

			session.trade_autobuy = (session.trade_autobuy === 1) ? 0 : 1
			await database.updateUser(session)

			if (cmd === OPTION_SET_TRADE_AUTOBUY) {

				executeCommand(chatid, messageId, callbackQueryId, { c: OPTION_MAIN_TRADE, k: sessionId })

			} else {
				const menu = await json_quickSettings(session.chatid);
				if (menu)
					switchMenu(chatid, messageId, await getQuickSetting(session), menu.options)
			}
		}

	} else if (cmd === OPTION_SET_TRADE_BUY_AMOUNT) {

		const sessionId = id;
		assert(sessionId)

		const msg = `Reply to this message with a buy amount you desire. This is the ${afx.get_chain_symbol()} amount that automatically buys when auto buy is triggered.`
		sendReplyMessage(chatid, msg)
		stateMap_setFocus(chatid, STATE_WAIT_SET_TRADE_BUY_AMOUNT, { sessionId, messageId })

    } else if (cmd === OPTION_SET_BUY_GAS_DELTA) {
		const parts = id.split(":");
		assert(parts.length == 2);
		const sessionId = parts[0];
		const jsonId = parseInt(parts[1]); //jsonId 1: setWalletConfig, 2: quickSettings
		assert(sessionId);
		assert(jsonId);

		const msg = `Reply to this message with your desired delta buy gas price (in gwei).

This is a delta value. Example:
AVG gas price = 5 gwei
Delta gas price = 3 gwei
Transaction gas price = 5 + 3 = 8 gwei`

		sendReplyMessage(chatid, msg);
		stateMap_setFocus(chatid, STATE_WAIT_SET_SNIPE_BUY_GAS_DELTA, {sessionId, messageId, jsonId});
    } else if (cmd === OPTION_SET_SELL_GAS_DELTA) {
		const parts = id.split(":");
		assert(parts.length == 2);
		const sessionId = parts[0];
		const jsonId = parseInt(parts[1]); //jsonId 1: setWalletConfig, 2: quickSettings
		assert(sessionId);
		assert(jsonId);

		const msg = `Reply to this message with your desired delta sell gas price (in gwei).

This is a delta value. Example:
AVG gas price = 5 gwei
Delta gas price = 3 gwei
Transaction gas price = 5 + 3 = 8 gwei`;

		sendReplyMessage(chatid, msg);
		stateMap_setFocus(chatid, STATE_WAIT_SET_SNIPE_SELL_GAS_DELTA, {sessionId, messageId, jsonId});

    } else if (cmd === OPTION_SET_TRADE_AUTOSELL || cmd === OPTION_SET_QUICK_AUTOSELL) {
		const sessionId = id;
		assert(sessionId)

		const session = sessions.get(sessionId)
		if (session) {

			session.trade_autosell = session.trade_autosell ?? 0
			session.trade_autosell = (session.trade_autosell === 1) ? 0 : 1
			await database.updateUser(session)

			if (cmd === OPTION_SET_TRADE_AUTOSELL) {

				executeCommand(chatid, messageId, callbackQueryId, { c: OPTION_MAIN_TRADE, k: sessionId })

			} else {
				const menu = await json_quickSettings(session.chatid);
				if (menu)
					switchMenu(chatid, messageId, await getQuickSetting(session), menu.options)
			}
		}

	} else if (cmd === OPTION_SET_TRADE_SELL_HI) {

		const sessionId = id;
		assert(sessionId)

		const msg = `Reply to this message with a sell percentage you desire. This is the HIGH threshold at which you'll auto sell for profits.\n\nExample: 2x would be 100.`
		sendReplyMessage(chatid, msg)
		stateMap_setFocus(chatid, STATE_WAIT_SET_TRADE_SELL_HI, { sessionId, messageId })

	} else if (cmd === OPTION_SET_TRADE_SELL_LO) {

		const sessionId = id;
		assert(sessionId)

		const msg = `Reply to this message with a sell percentage you desire. This is the LOW threshold at which you'll auto sell to prevent further losses (stop-loss). Example: 0.5x would be -50.`
		sendReplyMessage(chatid, msg)
		stateMap_setFocus(chatid, STATE_WAIT_SET_TRADE_SELL_LO, { sessionId, messageId })

	} else if (cmd === OPTION_SET_TRADE_SELL_HI_AMOUNT) {

		const sessionId = id;
		assert(sessionId)

		const msg = `Reply to this message with a sell amount % you desire. This represents how much of your holdings you want to sell when sell-high is triggered.\n\nExample: If you want to sell half of your bag, type 50.`
		sendReplyMessage(chatid, msg)
		stateMap_setFocus(chatid, STATE_WAIT_SET_TRADE_SELL_HI_AMOUNT, { sessionId, messageId })

	} else if (cmd === OPTION_SET_TRADE_SELL_LO_AMOUNT) {

		const sessionId = id;
		assert(sessionId)

		const msg = `Reply to this message with a sell amount you desire. This represents how much of your holdings you want to sell when sell-low is triggered. Example: If you want to sell half of your bag, type 50.`
		sendReplyMessage(chatid, msg)
		stateMap_setFocus(chatid, STATE_WAIT_SET_TRADE_SELL_LO_AMOUNT, { sessionId, messageId })

	} else if (cmd === OPTION_SET_TRADE_TOKEN_ADD) {

		const sessionId = id;
		assert(sessionId)

		const msg = `Reply to this message with a token address you want to sell automatically`
		sendReplyMessage(chatid, msg)
		await bot.answerCallbackQuery(callbackQueryId, { text: msg })

		stateMap_setFocus(chatid, STATE_WAIT_ADD_AUTOSELLTOKEN, { sessionId, messageId })

	} else if (cmd === OPTION_SET_TRADE_TOKEN_SHOW) {

		const sessionId = id;
		assert(sessionId)

		const menu = await json_showAutoTradeTokensOption(sessionId);
		if (menu)
			switchMenu(chatid, messageId, menu.title, menu.options)

	} else if (cmd === OPTION_SET_TRADE_TOKEN_REMOVEALL) {

		const sessionId = id;
		assert(sessionId)
		const result = await removeAutoSellAllData(database, sessionId)
		if (result.deletedCount > 0) {
			// sendInfoMessage(chatid, `✅ All of pool addresses you added has been successfully removed.`)	
			await bot.answerCallbackQuery(callbackQueryId, { text: `Successfully removed` })

			executeCommand(chatid, messageId, callbackQueryId, { c: OPTION_MAIN_TRADE, k: sessionId })
		}

	} else if (cmd === OPTION_SET_TRADE_TOKEN_REMOVE) {

		const parts = id.split(':')
		assert(parts.length == 2)
		const sessionId = parts[0]
		const tokenId = parts[1]
		assert(sessionId)
		assert(tokenId)
		await removeAutoSellAllDataByTokenId(database, tokenId)
		//sendInfoMessage(chatid, `✅ The pool addresses you selected has been successfully removed.`)
		await bot.answerCallbackQuery(callbackQueryId, { text: `Successfully removed` })
		executeCommand(chatid, messageId, callbackQueryId, { c: OPTION_SET_TRADE_TOKEN_SHOW, k: sessionId })

	} else if (cmd === OPTION_SET_TRADE_RESET) {

		const sessionId = id;
		assert(sessionId)

		const msg = `Please enter 'Yes' to make sure you want to reset configuration. (Yes for set to default, otherwise, cancel default set)`
		sendReplyMessage(chatid, msg)

		stateMap_setFocus(chatid, STATE_WAIT_SET_TRADE_RESET, { sessionId, messageId })

	} else if (cmd === OPTION_SET_SNIPE_MANUAL_TOKEN_ADD) {

		const sessionId = id;
		assert(sessionId)

		const msg = `Reply to this message with a token address you want to snipe`
		sendReplyMessage(chatid, msg)

		stateMap_setFocus(chatid, STATE_WAIT_ADD_SNIPING_TOKEN, { sessionId, messageId })

	} else if (cmd === OPTION_SET_SNIPE_MANUAL_TOKEN_SHOW) {

		const sessionId = id;
		assert(sessionId)

		const menu = await json_showTokenSnippingsOption(sessionId);
		if (menu)
			switchMenu(chatid, messageId, menu.title, menu.options)

	} else if (cmd === OPTION_SET_SNIPE_MANUAL_TOKEN_REMOVEALL) {

		const sessionId = id;
		assert(sessionId)

		const result = await database.removeTokenSnippingByUser(sessionId)
		if (result.deletedCount > 0) {
			// sendInfoMessage(chatid, `✅ All of pool addresses you added has been successfully removed.`)	
			await bot.answerCallbackQuery(callbackQueryId, { text: `Successfully removed` })

			executeCommand(chatid, messageId, callbackQueryId, { c: OPTION_MAIN_SNIPE, k: sessionId })
		}

	} else if (cmd === OPTION_SET_SNIPE_MANUAL_TOKEN_REMOVE) {

		const parts = id.split(':')
		assert(parts.length == 2)
		const sessionId = parts[0]
		const tokenId = parts[1]
		assert(sessionId)
		assert(tokenId)

		await database.removeTokenSnippingById(tokenId)
		//sendInfoMessage(chatid, `✅ The pool addresses you selected has been successfully removed.`)
		await bot.answerCallbackQuery(callbackQueryId, { text: `Successfully removed` })

		executeCommand(chatid, messageId, callbackQueryId, { c: OPTION_SET_SNIPE_MANUAL_TOKEN_SHOW, k: sessionId })

	} else if (cmd === OPTION_MSG_SNIPE_REMOVE) {

		const parts = id.split(':')
		assert(parts.length == 2)
		const sessionId = parts[0]
		const poolId = parts[1]
		assert(sessionId)
		assert(poolId)

		const addrInfo = await getAddrInfoFromPoolId(poolId)

		if (addrInfo) {

			await database.removeTokenSnipping(sessionId, addrInfo.token_address)
			await bot.answerCallbackQuery(callbackQueryId, { text: `Successfully removed` })

			const menu = await json_scanMsgOption(sessionId, poolId, addrInfo.token_address, true)
			if (menu) {
				editAnimationMessageOption(sessionId, messageId, menu.options)
			}
		}

	} else if (cmd === OPTION_PANEL_PREV_PANEL || cmd === OPTION_PANEL_NEXT_PANEL) {

		const parts = id.split(':')
		assert(parts.length == 2)
		const sessionId = parts[0]
		const panelId = parseInt(parts[1])
		assert(sessionId)
		assert(panelId)

		if (panelId < 0) {
			bot.answerCallbackQuery(callbackQueryId, { text: 'No panel item' })
			return
		}

		// trackPanel(sessionId, panelId, messageId)
		tokenTrackPanel(sessionId, panelId, messageId)//panelId means token_id

	} else if (cmd === OPTION_PANEL_AUTOSELL_SET) {

			const parts = id.split(':')
			assert(parts.length == 2)
			const sessionId = parts[0]
			const panelId = parseInt(parts[1])
			assert(sessionId)
			assert(panelId)

			if (await database.countAutoSellTokens({ chatid: sessionId }) >= afx.Max_Sell_Count) {

				bot.answerCallbackQuery(callbackQueryId, { text: `😢 You cannot have more than 10 items on your auto-selling list. Please remove a previous items before adding a new one.` })

				return
			}

			// const panelData = await database.selectPanelHistory({ panel_id: panelId })
			const panelData = await database.selectTokenPanelHistory({ token_id: panelId })

			if (panelData) {
				console.log('OPTION_PANEL_AUTOSELL_SET', panelData)
				await removeLimitOrderAllDataByParam(database, {chatid: sessionId, address: panelData.token_address.toLowerCase()});
				database.addAutoSellToken(
					sessionId,
					panelData.token_address,
					panelData.token_name,
					panelData.token_symbol,
					panelData.token_decimal,
					panelData.token_price
				);
				// trackPanel(sessionId, panelId, messageId)
				tokenTrackPanel(sessionId, panelId, messageId)
			}
		} else if (cmd === OPTION_PANEL_AUTOSELL_REMOVE) {

			const parts = id.split(':')
			assert(parts.length == 2)
			const sessionId = parts[0]
			const panelId = parseInt(parts[1])
			assert(sessionId)
			assert(panelId)

			// const panelData = await database.selectPanelHistory({ panel_id: panelId })
			const panelData = await database.selectTokenPanelHistory({ token_id: panelId })

			if (panelData) {
				await removeAutoSellAllDataByParam(database, { chatid: sessionId, address: panelData.token_address.toLowerCase() })
				// trackPanel(sessionId, panelId, messageId)
				tokenTrackPanel(sessionId, panelId, messageId)
			}

		} else if (cmd === OPTION_SET_SIMULATION_INIT_ETH_AMOUNT) {

			const sessionId = id;
			assert(sessionId)

			const msg = `Reply to this message with ${afx.get_chain_symbol()} amount to invest`
			sendReplyMessage(chatid, msg)
			await bot.answerCallbackQuery(callbackQueryId, { text: msg })

			stateMap_setFocus(chatid, STATE_WAIT_SIMULATION_SET_ETH, { sessionId, messageId, callbackQueryId })

		} else if (cmd === OPTION_SET_SIMULATION_PROFIT_TARGET) {

			const sessionId = id;
			assert(sessionId)

			const msg = `Reply to this message with profit target (X 3)`
			sendReplyMessage(chatid, msg)
			await bot.answerCallbackQuery(callbackQueryId, { text: msg })

			stateMap_setFocus(chatid, STATE_WAIT_SIMULATION_SET_PROFIT_TARGET, { sessionId, messageId, callbackQueryId })

		} else if (cmd === OPTION_SET_SIMULATION_TRAILING_STOP_LOSS) {

			const sessionId = id;
			assert(sessionId)

			const msg = `Reply to this message with trailing stop loss percent (1 ~ 100)`
			sendReplyMessage(chatid, msg)
			await bot.answerCallbackQuery(callbackQueryId, { text: msg })

			stateMap_setFocus(chatid, STATE_WAIT_SIMULATION_SET_TRAILING_STOP_LOSS, { sessionId, messageId, callbackQueryId })

		} else if (cmd === OPTION_SET_SIMULATION_START_DATE) {

			const sessionId = id;
			assert(sessionId)

			const msg = `Reply to this message with a start date (M/d/Y)`
			sendReplyMessage(chatid, msg)
			await bot.answerCallbackQuery(callbackQueryId, { text: msg })
			stateMap_setFocus(chatid, STATE_WAIT_SIMULATION_START_DATE, { sessionId, messageId, callbackQueryId })

		} else if (cmd === OPTION_SET_SIMULATION_END_DATE) {

			const sessionId = id;
			assert(sessionId)

			const msg = `Reply to this message with a end date (M/d/Y)`
			sendReplyMessage(chatid, msg)
			await bot.answerCallbackQuery(callbackQueryId, { text: msg })
			stateMap_setFocus(chatid, STATE_WAIT_SIMULATION_END_DATE, { sessionId, messageId, callbackQueryId })

		} else if (cmd === OPTION_SIMULATION_START) {

			const sessionId = id;
			assert(sessionId)

			// sendMessage(sessionId, 'This function is only available for DarkMeta users')
			// return

			await sendMessage(sessionId, `Simulation has been started...`);

			simulator.simulation(utils.web3Inst, sessionId)
		} else if (cmd === OPTION_SIMULATION_STARTWITHATOKEN) {

			const sessionId = id;
			assert(sessionId)

			// sendMessage(sessionId, 'This function is only available for DarkMeta users')
			// return

			const msg = `Reply to this message with token adress you want to track`
			sendReplyMessage(chatid, msg)
			await bot.answerCallbackQuery(callbackQueryId, { text: msg })
			stateMap_setFocus(chatid, STATE_WAIT_SIMULATION_TOKEN_ADDRESS, { sessionId, messageId })
      
		} else if (cmd === OPTION_SIMULATION_SETTING) {

			const sessionId = id;
			assert(sessionId)

			const menu = await json_simulationSettings(sessionId);
			if (menu)
				openMenu(chatid, cmd, menu.title, menu.options)
			//switchMenu(chatid, messageId, get_menuTitle(sessionId, menu.title), menu.options)

		} else if (cmd === OPTION_PANEL_DELETE) {

			const parts = id.split(':')
			assert(parts.length == 2)
			const sessionId = parts[0]
			const panelId = parseInt(parts[1])
			assert(sessionId)
			assert(panelId)
			//panelId means tokenId
			// const { prevId, nextId } = await database.selectPanelHistoryNearIds(sessionId, panelId)
			// await database.removePanelHistory(panelId)
			const { prevId, nextId } = await database.selectTokenPanelHistoryNearIds(sessionId, panelId)
			await database.removeTokenPanelHistory(panelId)
			await database.removeLimitOrderToken(panelId)

			let newPanelId = -1
			if (prevId > 0) {
				newPanelId = prevId
			}
			if (newPanelId < 0 && nextId > 0) {
				newPanelId = nextId
			}
			
			if (newPanelId >= 0) {

				// trackPanel(sessionId, newPanelId, messageId)
				tokenTrackPanel(sessionId, newPanelId, messageId)

			} else {

				removeMessage(sessionId, messageId)
			}
		} else if (cmd === OPTION_PANEL_REFRESH) {

			const parts = id.split(':')
			assert(parts.length == 2)
			const sessionId = parts[0]
			const panelId = parseInt(parts[1])
			assert(sessionId)
			assert(panelId)

			// const panelData = await database.selectPanelHistory({ panel_id: panelId })
			const panelData = await database.selectTokenPanelHistory({ token_id: panelId })

			if (panelData && utils.web3Inst) {

				const txHash = panelData.tx_hash
				const tokenPrice = panelData.token_price
				const tokenName = panelData.token_name
				const tokenSupply = panelData.token_supply
				const tokenAddress = panelData.token_address
				const buyAmount = panelData.eth_amount
				const boughtTokenAmount = panelData.token_amount

				monitorPanel.investigate(utils.web3Inst, txHash, tokenName, tokenAddress, tokenPrice, tokenSupply, buyAmount, boughtTokenAmount, async (msg) => {

					// await dataHistory.storePanelData(sessionId, panelId, panelId, tokenName, msg)

					// trackPanel(sessionId, panelId, messageId)
					tokenTrackPanel(sessionId, panelId, messageId)
				})
			}

		} else if (cmd === OPTION_CLOSE) {

			const sessionId = id;
			assert(sessionId)

			removeMessage(sessionId, messageId)
		} else if (cmd === OPTION_SWAP_BUYTOKEN) {

			const sessionId = id;
			assert(sessionId)

			const menu = await json_swapBuyMsgOption(sessionId);

			const session = sessions.get(sessionId)
			if (session) {

				const message = await getWalletOptionMsg(session.chatid)
				switchMenu(sessionId, messageId, message, menu.options)
			}

		} else if (cmd === OPTION_SWAP_SELLTOKEN) {

			const sessionId = id;
			assert(sessionId)

			const menu = await json_swapSellMsgOption(sessionId);

			const session = sessions.get(sessionId)
			if (session) {

				const message = await getWalletOptionMsg(session.chatid)
				switchMenu(sessionId, messageId, message, menu.options)
			}
		} else if (cmd === OPTION_SWAP_ACCOUNT_1) {
			const sessionId = id;
			assert(sessionId)

			let session = sessions.get(sessionId)
			if (session) {

				session.wallets_index = 0;
				session.pkey = session.wallets[session.wallets_index].pkey;
				session.account = session.wallets[session.wallets_index].account;
				await database.updateUser(session)

				executeCommand(chatid, messageId, callbackQueryId, { c: OPTION_SWAP_BOT, k: sessionId })
			}
		} else if (cmd === OPTION_SWAP_ACCOUNT_2) {
			const sessionId = id;
			assert(sessionId)

			let session = sessions.get(sessionId)
			if (session) {

				session.wallets_index = 1;
				session.pkey = session.wallets[session.wallets_index].pkey;
				session.account = session.wallets[session.wallets_index].account;
				await database.updateUser(session)

				executeCommand(chatid, messageId, callbackQueryId, { c: OPTION_SWAP_BOT, k: sessionId })
			}
		} else if (cmd === OPTION_SWAP_ACCOUNT_3) {
			const sessionId = id;
			assert(sessionId)

			let session = sessions.get(sessionId)
			if (session) {

				session.wallets_index = 2;
				session.pkey = session.wallets[session.wallets_index].pkey;
				session.account = session.wallets[session.wallets_index].account;
				await database.updateUser(session)

				executeCommand(chatid, messageId, callbackQueryId, { c: OPTION_SWAP_BOT, k: sessionId })
			}
		} else if (cmd === OPTION_SWAP_BUY_0_1 ||
			cmd === OPTION_SWAP_BUY_0_25 ||
			cmd === OPTION_SWAP_BUY_0_5) {
			const sessionId = id;
			assert(sessionId)
			let session = sessions.get(sessionId)
			let ethAmountMap = new Map()

			ethAmountMap.set(OPTION_SWAP_BUY_0_1, 0.1)
			ethAmountMap.set(OPTION_SWAP_BUY_0_25, 0.25)
			ethAmountMap.set(OPTION_SWAP_BUY_0_5, 0.5)
			let ethAmount = ethAmountMap.get(cmd)
			if (session) {
				if (!session.pkey) {
					bot.answerCallbackQuery(callbackQueryId, { text: `Please add your wallet in the setting and then try again` })
					return
				}
				const msg = '📝Enter the token address you wish to buy and send transaction immediately:'
				sendReplyMessage(sessionId, msg)
				stateMap_setFocus(chatid, STATE_WAIT_SWAP_BUY, { sessionId, amount: ethAmount, messageId })
			}
		} else if (cmd === OPTION_SWAP_BUY_TOKEN_X) {
			const sessionId = id;
			let session = sessions.get(sessionId)
			if (session) {
				if (!session.pkey) {
					bot.answerCallbackQuery(callbackQueryId, { text: `Please add your wallet in the setting and then try again` })
					return
				}
				const msg = `📝Enter the ${afx.get_chain_symbol()} amount you wish to buy. For example 0.5`
				sendReplyMessage(sessionId, msg)
				stateMap_setFocus(chatid, STATE_WAIT_SWAP_BUY_X, { sessionId, messageId })
			}
    } else if (cmd === OPTION_SWAP_SELL_PERCENT_25 ||
			cmd === OPTION_SWAP_SELL_PERCENT_50 ||
			cmd === OPTION_SWAP_SELL_PERCENT_75 ||
			cmd === OPTION_SWAP_SELL_PERCENT_100) {
			const sessionId = id;
			assert(sessionId)
			let session = sessions.get(sessionId)
			let ethAmountMap = new Map()

			ethAmountMap.set(OPTION_SWAP_SELL_PERCENT_25, 25)
			ethAmountMap.set(OPTION_SWAP_SELL_PERCENT_50, 50)
			ethAmountMap.set(OPTION_SWAP_SELL_PERCENT_75, 75)
			ethAmountMap.set(OPTION_SWAP_SELL_PERCENT_100, 100)
			let ethAmount = ethAmountMap.get(cmd)
			if (session) {
				if (!session.pkey) {
					bot.answerCallbackQuery(callbackQueryId, { text: `Please add your wallet in the setting and then try again` })
					return
				}
				const msg = '📝Enter the token address you wish to sell and send transaction immediately:'
				sendReplyMessage(sessionId, msg)
				stateMap_setFocus(chatid, STATE_WAIT_SWAP_SELL, { sessionId, amount: ethAmount, messageId })
			}
		} else if (cmd === OPTION_SWAP_SELL_PERCENT_X) {
			const sessionId = id;
			let session = sessions.get(sessionId)
			if (session) {
				if (!session.pkey) {
					bot.answerCallbackQuery(callbackQueryId, { text: `Please add your wallet in the setting and then try again` })
					return
				}
				const msg = `📝Enter the percent you wish to sell. For example 60`
				sendReplyMessage(sessionId, msg)
				stateMap_setFocus(chatid, STATE_WAIT_SWAP_SELL_X, { sessionId, messageId })
			}
		} else if (cmd === OPTION_REFERRAL_WITHDRAW_WALLET) {
      const sessionId = id;
      assert(sessionId);

      const msg = `Reply to this message with your withdrawal wallet address`;
      sendReplyMessage(chatid, msg);
      stateMap_setFocus(chatid, STATE_WAIT_SET_REFERRAL_WITHDRAW_WALLET, {
        sessionId,
        messageId,
        callbackQueryId,
      });
    } //===================RJM======================
    else if (cmd == OPTION_SNIPE_WALLET_SHOW) {
      const sessionId = id;
      assert(sessionId);

      const menu = json_setWallet1(sessionId);
      // console.log("====================wallet show=====================")
      if (menu) {
        openMenu(
          chatid,
          cmd,
          await getWalletOptionMsg(sessionId),
          menu.options
        );
      }
    } else if (cmd == OPTION_WALLET_CONFIG) {
      const sessionId = id;
      assert(sessionId);

      // console.log("=========================setConfig===============================")
      const menu = await json_setWalletConfig(sessionId);
      if (menu)
        openMenu(chatid, cmd, await getConfigOptionMsg(sessionId), menu.options);
    } else if (cmd == OPTION_CONFIG_BUY_SLIPPAGE) {
      const parts = id.split(":");
      assert(parts.length == 2);
      const sessionId = parts[0];
      const jsonId = parseInt(parts[1]); //jsonId 1: setWalletConfig, 2: quickSettings
      assert(sessionId);
      assert(jsonId);

      const msg = `Reply to this message with your desired slippage percentage. Minimum is 0.1%. Max is 100%`;
      sendReplyMessage(chatid, msg);
      stateMap_setFocus(chatid, STATE_WAIT_SET_SNIPE_BUY_SLIPPAGE, {sessionId, messageId, jsonId,});

      // const menu = await json_setConfig(sessionId)
      // if (menu)
      // 	openMenu(chatid, cmd, await getConfigOptionMsg(sessionId), menu.options)
    } else if (cmd == OPTION_CONFIG_SELL_SLIPPAGE) {
      const parts = id.split(":");
      assert(parts.length == 2);
      const sessionId = parts[0];
      const jsonId = parseInt(parts[1]); //jsonId 1: setWalletConfig, 2: quickSettings
      assert(sessionId);
      assert(jsonId);

      const msg = `Reply to this message with your desired slippage percentage. Minimum is 0.1%. Max is 100%`;
      sendReplyMessage(chatid, msg);
      stateMap_setFocus(chatid, STATE_WAIT_SET_SNIPE_SELL_SLIPPAGE, {sessionId, messageId, jsonId,});

    } else if (cmd == OPTION_CONFIG_SWITCH_SETTING) {
      const sessionId = id;
      assert(sessionId);

      const menu = await json_setSwitchSetting(sessionId);
      if (menu) {
        openMenu(chatid, cmd, await getSwitchSettingMsg(sessionId), menu.options);
      }
    } else if (cmd == OPTION_CONFIG_OVERVIEW) {
      const sessionId = id;
      assert(sessionId);

      const menu = json_setConfigOverview(sessionId);

      if (menu) {
        openMenu(chatid, cmd, await getConfigOverviewMsg(sessionId), menu.options);
      }
    } else if (cmd == OPTION_SET_LIMIT_ORDER_ADD) {
      const parts = id.split(":");
      assert(parts.length == 2);
      const sessionId = parts[0];
      const panelId = parseInt(parts[1]);
      assert(sessionId);
      assert(panelId);

      if ((await database.countLimitOrderTokens({ chatid: sessionId })) >= afx.Max_Sell_Count) {
        bot.answerCallbackQuery(callbackQueryId, {text: `😢 You cannot have more than 10 items on your limit order list. Please remove a previous items before adding a new one.`,});

        return;
      }

    //   const panelData = await database.selectPanelHistory({panel_id: panelId,});
	  const panelData = await database.selectTokenPanelHistory({token_id: poolId})

      const session = sessions.get(sessionId);
      if (panelData) {
        await removeAutoSellAllDataByParam(database, {chatid: sessionId, address: panelData.token_address.toLowerCase(),});
        database.addLimitOrderToken(
          sessionId,
          panelData.token_address,
          panelData.token_name,
          panelData.token_symbol,
          panelData.token_decimal,
          panelData.token_price,
          session.limit_order_lo_enabled,
          session.limit_order_lo,
          session.limit_order_lo_amount,
          session.limit_order_hi_enabled,
          session.limit_order_hi,
          session.limit_order_hi_amount,
        );
        
        // trackPanel(sessionId, panelId, messageId);
		tokenTrackPanel(sessionId, panelId, messageId)
      }
    } else if (cmd == OPTION_SET_LIMIT_ORDER_REMOVE) {
      const parts = id.split(":");
      assert(parts.length == 2);
      const sessionId = parts[0];
      const panelId = parseInt(parts[1]);
      assert(sessionId);
      assert(panelId);

    //   const panelData = await database.selectPanelHistory({panel_id: panelId,});
	  const panelData = await database.selectTokenPanelHistory({token_id: panelId});
      if (panelData) {
        await removeLimitOrderAllDataByParam(database, {chatid: sessionId, address: panelData.token_address.toLowerCase(),});
        // trackPanel(sessionId, panelId, messageId);
		tokenTrackPanel(sessionId, panelId, messageId)
		}
    } else if (cmd == OPTION_SET_LIMIT_ORDER_LO) {
      const parts = id.split(":");
      assert(parts.length == 2);
      const sessionId = parts[0];
      const panelId = parseInt(parts[1]);
      assert(sessionId);
      assert(panelId);

    //   const panelData = await database.selectPanelHistory({panel_id: panelId,});
	  const panelData = await database.selectTokenPanelHistory({token_id: panelId});
      if (panelData) {
        const limitOrderToken =  await database.selectOneLimitOrderToken({address: panelData.token_address});
        if (!limitOrderToken) {
          const msgNoExist = `Before setting you must add to the token list.`;
          sendReplyMessage(chatid, msgNoExist);
          return
      }

        const msg = `Reply to this message with a sell percentage you desire. This is the LOW threshold at which you'll auto sell to prevent further losses (stop-loss). Example: 0.5x would be -50.`;
        sendReplyMessage(chatid, msg);
        stateMap_setFocus(chatid, STATE_WAIT_SET_LIMIT_ORDER_LO, {sessionId, panelId, messageId, limitOrderToken});
      }
    }  else if (cmd == OPTION_SET_LIMIT_ORDER_HI) {
      const parts = id.split(":");
      assert(parts.length == 2);
      const sessionId = parts[0];
      const panelId = parseInt(parts[1]);
      assert(sessionId);
      assert(panelId);

    //   const panelData = await database.selectPanelHistory({panel_id: panelId,});
	  const panelData = await database.selectTokenPanelHistory({token_id: panelId});
      if (panelData) {
        const limitOrderToken =  await database.selectOneLimitOrderToken({address: panelData.token_address});
        if (!limitOrderToken) {
          const msgNoExist = `Before setting you must add to the token list.`;
          sendReplyMessage(chatid, msgNoExist);
          return
		}

      const msg = `Reply to this message with a sell percentage you desire. This is the HIGH threshold at which you'll auto sell for profits.\n\nExample: 2x would be 100.`
      sendReplyMessage(chatid, msg);
      stateMap_setFocus(chatid, STATE_WAIT_SET_LIMIT_ORDER_HI, {sessionId, panelId, messageId, limitOrderToken});
      }
    } else if (cmd == OPTION_SET_LIMIT_ORDER_LO_AMOUNT) {
      const parts = id.split(":");
      assert(parts.length == 2);
      const sessionId = parts[0];
      const panelId = parseInt(parts[1]);
      assert(sessionId);
      assert(panelId);

    //   const panelData = await database.selectPanelHistory({panel_id: panelId,});
	  const panelData = await database.selectTokenPanelHistory({token_id: panelId});
      if (!panelData) return;

      const limitOrderToken =  await database.selectOneLimitOrderToken({address: panelData.token_address});
      if (!limitOrderToken) {
        const msgNoExist = `Before setting you must add to the token list.`;
        sendReplyMessage(chatid, msgNoExist);
        return
      }

      const msg = `Reply to this message with a sell amount you desire. This represents how much of your holdings you want to sell when sell-low is triggered. Example: If you want to sell half of your bag, type 50.`;
      sendReplyMessage(chatid, msg);
      stateMap_setFocus(chatid, STATE_WAIT_SET_LIMIT_ORDER_LO_AMOUNT, {sessionId, messageId, panelId, limitOrderToken});
    } else if (cmd == OPTION_SET_LIMIT_ORDER_HI_AMOUNT) {
      const parts = id.split(":");
      assert(parts.length == 2);
      const sessionId = parts[0];
      const panelId = parseInt(parts[1]);
      assert(sessionId);
      assert(panelId);

    //   const panelData = await database.selectPanelHistory({panel_id: panelId,});
      const panelData = await database.selectTokenPanelHistory({token_id: panelId,});
      if (!panelData) return;

      const limitOrderToken =  await database.selectOneLimitOrderToken({address: panelData.token_address});
      if (!limitOrderToken) {
        const msgNoExist = `Before setting you must add to the token list.`;
        sendReplyMessage(chatid, msgNoExist);
        return
      }

      const msg = `Reply to this message with a sell amount you desire. This represents how much of your holdings you want to sell when sell-hi is triggered. Example: If you want to sell half of your bag, type 50.`;
      sendReplyMessage(chatid, msg);
      stateMap_setFocus(chatid, STATE_WAIT_SET_LIMIT_ORDER_HI_AMOUNT, {sessionId, messageId, panelId, limitOrderToken});

    } else if (cmd == OPTION_SET_LIMIT_ORDER_LO_ENABLE) {
      const parts = id.split(":");
      assert(parts.length == 2);
      const sessionId = parts[0];
      const panelId = parseInt(parts[1]);
      assert(sessionId);
      assert(panelId);

    //   const panelData = await database.selectPanelHistory({panel_id: panelId,});
	  const panelData = await database.selectTokenPanelHistory({token_id: panelId});
      if (!panelData) {
        sendInfoMessage(privateId, `There is no token trading history.`)
        return
      }
      const limitOrderToken =  await database.selectOneLimitOrderToken({address: panelData.token_address});
      if (limitOrderToken) {//Update
        limitOrderToken.sell_lo_enabled = 1;
        database.updateLimitOrderToken(limitOrderToken);
      } else {//Add
        if ((await database.countLimitOrderTokens({ chatid: sessionId })) >= afx.Max_Sell_Count) {
          bot.answerCallbackQuery(callbackQueryId, {text: `😢 You cannot have more than 10 items on your limit order list. Please remove a previous items before adding a new one.`,});  
          return;
        }
        
        const session = sessions.get(sessionId)
        session.limit_order_lo_enabled = 1;
        await removeAutoSellAllDataByParam(database, {chatid: sessionId, address: panelData.token_address.toLowerCase(),});
        console.log("session limit order settings")
        console.log("limit_order_lo_enabled", session.limit_order_lo_enabled)
        console.log("limit_order_hi_enabled", session.limit_order_hi_enabled)
        database.addLimitOrderToken(
          sessionId,
          panelData.token_address,
          panelData.token_name,
          panelData.token_symbol,
          panelData.token_decimal,
          panelData.token_price,
          session.limit_order_lo_enabled,
          session.limit_order_lo,
          session.limit_order_lo_amount,
          session.limit_order_hi_enabled,
          session.limit_order_hi,
          session.limit_order_hi_amount,
        );
      }
      sendInfoMessage(sessionId, `✅ Successfully updated limit order sell setting`)
    //   trackPanel(sessionId, panelId, messageId);
	  tokenTrackPanel(sessionId, panelId, messageId)

    } else if (cmd == OPTION_SET_LIMIT_ORDER_LO_DISABLE) {
      const parts = id.split(":");
      assert(parts.length == 2);
      const sessionId = parts[0];
      const panelId = parseInt(parts[1]);
      assert(sessionId);
      assert(panelId);

    //   const panelData = await database.selectPanelHistory({panel_id: panelId,});
	  const panelData = await database.selectTokenPanelHistory({token_id: panelId});
      if (!panelData) {
        sendInfoMessage(privateId, `There is no token trading history.`)
        return
      }
      const session = sessions.get(sessionId)
      const limitOrderToken =  await database.selectOneLimitOrderToken({address: panelData.token_address});
      if (!limitOrderToken) return;
      if (session.limit_order_hi_enabled) {//Update
        limitOrderToken.sell_lo_enabled = 0;
        await database.updateLimitOrderToken(limitOrderToken);        
        await removeAutoSellAllDataByParam(database, {chatid: sessionId, address: panelData.token_address.toLowerCase(),});
      } else {//Delete
        await removeLimitOrderAllDataByParam(database, {chatid: sessionId, address: panelData.token_address.toLowerCase(),});
      }
      sendInfoMessage(sessionId, `✅ Successfully updated limit order sell setting`)
    //   trackPanel(sessionId, panelId, messageId);
	tokenTrackPanel(sessionId, panelId, messageId)
    } else if (cmd == OPTION_SET_LIMIT_ORDER_HI_ENABLE) {
      const parts = id.split(":");
      assert(parts.length == 2);
      const sessionId = parts[0];
      const panelId = parseInt(parts[1]);
      assert(sessionId);
      assert(panelId);

    //   const panelData = await database.selectPanelHistory({panel_id: panelId,});
	  const panelData = await database.selectTokenPanelHistory({token_id: panelId});
      if (!panelData) {
        sendInfoMessage(privateId, `There is no token trading history.`)
        return
      }
      const limitOrderToken =  await database.selectOneLimitOrderToken({address: panelData.token_address});
      if (limitOrderToken) {//Update
        limitOrderToken.sell_hi_enabled = 1;
        database.updateLimitOrderToken(limitOrderToken);
      } else {//Add
        if ((await database.countLimitOrderTokens({ chatid: sessionId })) >= afx.Max_Sell_Count) {
          bot.answerCallbackQuery(callbackQueryId, {text: `😢 You cannot have more than 10 items on your limit order list. Please remove a previous items before adding a new one.`,});  
          return;
        }
        
        const session = sessions.get(sessionId)
        session.limit_order_hi_enabled = 1;
        await removeAutoSellAllDataByParam(database, {chatid: sessionId, address: panelData.token_address.toLowerCase(),});
        database.addLimitOrderToken(
          sessionId,
          panelData.token_address,
          panelData.token_name,
          panelData.token_symbol,
          panelData.token_decimal,
          panelData.token_price,
          session.limit_order_lo_enabled,
          session.limit_order_lo,
          session.limit_order_lo_amount,
          session.limit_order_hi_enabled,
          session.limit_order_hi,
          session.limit_order_hi_amount,
        );
      }
      sendInfoMessage(sessionId, `✅ Successfully updated limit order sell setting`)
    //   trackPanel(sessionId, panelId, messageId);
	  tokenTrackPanel(sessionId, panelId, messageId)

    } else if (cmd == OPTION_SET_LIMIT_ORDER_HI_DISABLE) {
      const parts = id.split(":");
      assert(parts.length == 2);
      const sessionId = parts[0];
      const panelId = parseInt(parts[1]);
      assert(sessionId);
      assert(panelId);

    //   const panelData = await database.selectPanelHistory({panel_id: panelId,});
	  const panelData = await database.selectTokenPanelHistory({token_id: panelId});
      if (!panelData) {
        sendInfoMessage(privateId, `There is no token trading history.`)
        return
      }
      const session = sessions.get(sessionId)
      const limitOrderToken =  await database.selectOneLimitOrderToken({address: panelData.token_address});
      if (!limitOrderToken) return;
      if (session.limit_order_lo_enabled) {//Update
        limitOrderToken.sell_hi_enabled = 0;
        await database.updateLimitOrderToken(limitOrderToken);        
        await removeAutoSellAllDataByParam(database, {chatid: sessionId, address: panelData.token_address.toLowerCase(),});
      } else {//Delete
        await removeLimitOrderAllDataByParam(database, {chatid: sessionId, address: panelData.token_address.toLowerCase(),});
      }
      sendInfoMessage(sessionId, `✅ Successfully updated limit order sell setting`)
    //   trackPanel(sessionId, panelId, messageId);
		tokenTrackPanel(sessionId, panelId, messageId)
    } else if (cmd == OPTION_SET_PASTED_CONTRACT_BUY) {
		const sessionId = id;
		assert(sessionId);

		const session = sessions.get(sessionId);
		session.quick_pasted_contract_buy = session.quick_pasted_contract_buy ? 0 : 1;
		// console.log("=====================quick pasted constract buy========================")
		// console.log(session.quick_pasted_contract_buy);
		await database.updateUser(session)

		// await removeMessage(session.chatid, messageId)
			const menu = await json_quickSettings(session.chatid);
		if (menu)
			switchMenu(chatid, messageId, await getQuickSetting(session), menu.options)
    } else if (cmd == OPTION_SET_PASTED_CONTRACT_BUY_AMT) {
      const sessionId = id;
      assert(sessionId);

      const msg = `Reply to this message with your desired immediate buy amount on pasted-contract token.`;
      sendReplyMessage(chatid, msg);
      stateMap_setFocus(chatid, STATE_WAIT_SET_PASTED_CONTRACT_BUY_AMT, {sessionId, messageId,});
    }
    //===============================================
	} catch (error) {
		console.log(error)
		//afx.error_log('getTokexecuteCommand', error)
		sendMessage(chatid, `😢 Sorry, there was some errors on the command. Please try again later 😉`)
		if (callbackQueryId)
			await bot.answerCallbackQuery(callbackQueryId, { text: `😢 Sorry, there was some errors on the command. Please try again later 😉` })
	}
}

export const trackPanel = async (sessionId, panelId, messageId) => {

	const session = sessions.get(sessionId)
	if (!session) {
		return
	}

	if (panelId === 0) {
		const { prevId, nextId } = await database.selectPanelHistoryNearIds(sessionId, 9999999999)
		if (prevId > 0) {
			panelId = prevId
		}
	}

	if (panelId === 0) {
		return
	}

	const panelItem = await database.selectPanelHistory({ panel_id: panelId })

	if (!panelItem) {
		console.log(`No panel history for PanelID ${panelId}`)
		return
	}

	dataHistory.readPanelData(sessionId, panelId).then(async json => {

		let tokenName = '-'
		let prevId = -1, nextId = -1
		let msg = 'No information'

		//console.log('OutRead', json)

		if (json) {

			const result = await database.selectPanelHistoryNearIds(sessionId, panelId)
			tokenName = json.tokenName
			prevId = result.prevId
			nextId = result.nextId
			msg = json.data
		}

		//console.log(sessionId, prevId, panelId, nextId)

		const trades = await database.selectPanelHistories({ chatid: sessionId })
		let otherTradeMsg = ''
		let tradeIndex = 0
		for (const trade of trades) {
			tradeIndex++
			if (panelId === trade.panel_id) {
				otherTradeMsg += `<u>/${tradeIndex}</u> ${trade.token_name}\n`
			} else {
				otherTradeMsg += `/${tradeIndex} ${trade.token_name}\n`
			}
		}

// Get token balance in wallet
const privateKey = utils.decryptPKey(session.pkey)
console.log("privateKey", privateKey)
console.log("tokenAddress", panelItem.token_address)
let wallet = web3Http.eth.accounts.privateKeyToAccount(privateKey);
console.log("walleAddress", wallet.address)
let rawTokenBalance = await utils.getTokenBalanceFromWallet(utils.web3Inst, wallet.address, panelItem.token_address)
console.log("====================rawTokenBalance====================")
console.log(utils.roundDecimal(rawTokenBalance, 5))
// ===============================
    	msg = msg.replace("Other Trades:", `Token Balance: ${rawTokenBalance}\n\nOther Trades:`)
		msg = msg.replace('|OtherTrades|', otherTradeMsg)
		msg = msg.replace('|No|', String(panelId).padStart(5, '0'))


		const menu = await json_panelOption(sessionId, prevId, panelId, nextId, tokenName, panelItem.token_address)

		//console.log('sessionId, messageId, msg, menu.options', sessionId, messageId, msg, menu.options)
		if (messageId > 0) {

			editAnimationMessageText(sessionId, messageId, msg, menu.options)

		} else {

			const ret = await sendOptionMessage(sessionId, msg, menu.options)
			if (ret) {
				pinMessage(ret.chatid, ret.messageId)
			}
		}
	})
}

export const tokenTrackPanel = async (sessionId, tokenId, messageId, msg = null, tokenName = null) => {
	const session = sessions.get(sessionId)
	if (!session) {
		return
	}

	if (tokenId === 0) {
		const { prevId, nextId } = await database.selectTokenPanelHistoryNearIds(sessionId, 9999999999)
		if (prevId > 0) {
			tokenId = prevId
		}
	}

	if (tokenId === 0) {
		return
	}

	const tokenPanelItem = await database.selectTokenPanelHistory({ token_id: tokenId })

	if (!tokenPanelItem) {
		console.log(`No token panel history for TokenID ${tokenId}`)
		return
	}

	let prevId = -1, nextId = -1
	const result = await database.selectTokenPanelHistoryNearIds(sessionId, tokenId)
	prevId = result.prevId
	nextId = result.nextId

	// Get token balance in wallet
	console.log("session.pkey", session.pkey)
	const privateKey = utils.decryptPKey(session.pkey)
	// console.log("privateKey", privateKey)
	// console.log("tokenAddress", panelItem.token_address)
	let wallet = web3Http.eth.accounts.privateKeyToAccount(privateKey);
	console.log("walleAddress", wallet.address)
	let rawTokenBalance = await utils.getTokenBalanceFromWallet(utils.web3Inst, wallet.address, tokenPanelItem.token_address)
	console.log("====================rawTokenBalance====================")
	console.log(utils.roundDecimal(rawTokenBalance, 5))
	// ===============================
	if (msg) {
		const trades = await database.selectTokenPanelHistories({ chat_id: sessionId })
		let otherTradeMsg = ''
		let tradeIndex = 0
		for (const trade of trades) {
			tradeIndex ++
			if (tokenId === trade.token_id) {
				otherTradeMsg += `<u>/${tradeIndex}</u> ${trade.token_name}\n`
			} else {
				otherTradeMsg += `/${tradeIndex} ${trade.token_name}\n`
			}
		}
		msg = msg.replace("Other Trades:", `Token Balance: ${rawTokenBalance}\n\nOther Trades:`)
		msg = msg.replace('|OtherTrades|', otherTradeMsg)
		msg = msg.replace('|No|', String(tokenId).padStart(5, '0'))

		const menu = await json_panelOption(sessionId, prevId, tokenId, nextId, tokenPanelItem.token_name, tokenPanelItem.token_address)
		//console.log('sessionId, messageId, msg, menu.options', sessionId, messageId, msg, menu.options)
		if (messageId > 0) {
			editAnimationMessageText(sessionId, messageId, msg, menu.options)
		} else {
			const ret = await sendOptionMessage(sessionId, msg, menu.options)
			if (ret) {
				pinMessage(ret.chatid, ret.messageId)
			}
		}
	} else {
		monitorPanel.investigate(utils.web3Inst, tokenPanelItem.tx_hash[0], tokenPanelItem.token_name, tokenPanelItem.token_address, tokenPanelItem.token_price, tokenPanelItem.token_supply, tokenPanelItem.eth_amount, tokenPanelItem.token_amount, async (msg) => {
			console.log("===============tokenTrackPanel================", msg)
			const trades = await database.selectTokenPanelHistories({ chat_id: sessionId })
			console.log("trades", trades)
			let otherTradeMsg = ''
			let tradeIndex = 0
			for (const trade of trades) {
				tradeIndex++
				if (tokenId === trade.token_id) {
					otherTradeMsg += `<u>/${tradeIndex}</u> ${trade.token_name}\n`
				} else {
					otherTradeMsg += `/${tradeIndex} ${trade.token_name}\n`
				}
			}
			msg = msg.replace('Token Balance:', `Token Balance: ${rawTokenBalance}`)
			msg = msg.replace('|OtherTrades|', otherTradeMsg)
			msg = msg.replace('|No|', String(tokenId).padStart(5, '0'))
			const menu = await json_panelOption(sessionId, prevId, tokenId, nextId, tokenPanelItem.token_name, tokenPanelItem.token_address)
			if (messageId > 0) {
				editAnimationMessageText(sessionId, messageId, msg, menu.options)
			} else {
				const ret = await sendOptionMessage(sessionId, msg, menu.options)
				if (ret) {
					pinMessage(ret.chatid, ret.messageId)
				}
			}
		})
	}
}