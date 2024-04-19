import { ethers } from "ethers";
import { Uniswap_V2_Pool_ABI } from "./Uniswap_V2_Pool_ABI.js"
import EthDater from 'ethereum-block-by-date'
import * as instance from './bot.js'
import { getCallHistory } from "./db.js";
import * as utils from './utils.js'
import * as advUtils from './adv_utils.js'
import { waitBlock } from "./filter.js";
import * as afx from './global.js'

import { roundDecimal, getBlockTimeStampFromBlockNumber, getBlockNumberByTimestamp, sleep, getEthPrice, getTokenInfo } from "./utils.js";

export const userTotalProfit = new Map()

const calcTotalProfit = (sessionId) => {
    const userInfo = userTotalProfit.get(sessionId);
    if (!userInfo)
        return;
    if ((userInfo.calc_fail_amount + userInfo.calc_success_amount + userInfo.calc_rugs_amount) < userInfo.callhistory_limit)
        return;
    if (userInfo.calc_success_amount == 0){
        instance.sendMessage(sessionId, `No profit`);
        return;
    }
    const average_profit = userInfo.highestROI / (userInfo.callhistory_limit - userInfo.calc_fail_amount);
    const session = instance.sessions.get(sessionId)
    if (!session) {
        return
    }
    let dormantStat = ''
    if (session.min_dormant_wallet_count > 0) {
        dormantStat = `>= ${session.min_dormant_wallet_count}`
    } else {
        dormantStat = 'Off'
    }
    const simulation_total = `
	<u>Simulation Total Result</u>
    Total Investment: ${roundDecimal(userInfo.invest_amount, 4)} ${afx.get_chain_symbol()}
    Highest ROI potential: (${roundDecimal(userInfo.invest_amount, 4)} x ${roundDecimal(userInfo.highestROI / userInfo.invest_amount, 3)}): ${roundDecimal(userInfo.highestROI, 3)} ${afx.get_chain_symbol()} net profit
    Average Highest ROI: ${roundDecimal(average_profit, 3)} ${afx.get_chain_symbol()}
    ROI with algo (Tx & Swap Fee): (${roundDecimal(userInfo.invest_amount, 4)} x ${roundDecimal(userInfo.roi_algo / userInfo.invest_amount, 3)}): ${roundDecimal(userInfo.roi_algo, 3)} ${afx.get_chain_symbol()} net profit

<u>Current Settings</u>
    Initial liquidity: >= ${session.init_eth} ${afx.get_chain_symbol()}
    Fresh wallet: ${session.min_fresh_wallet_count ? ('>= ' + session.min_fresh_wallet_count) : 'Off'} 
    Whale: ${session.min_whale_wallet_count ? '>=' + session.min_whale_wallet_count : 'Off'} 
    KYC: ${session.min_kyc_wallet_count ? ('>= ' + session.min_kyc_wallet_count) : 'Off'} 
    Dormant wallet Filter: ${dormantStat}
    LP Lock Filter: ${session.lp_lock ? 'On' : 'Off'}
    Honeypot Filter: ${session.honeypot ? 'On' : 'Off'}
    Contract Age Filter: ${session.contract_age > 0 ? session.contract_age + '+ days' : 'Off'}

    Algo Profit Target: x${session.simulation_profit_target}
    Algo Trailing %: ${session.simulation_trailing_stop_loss}
    Start Date: ${session.simulation_start_date}
    End Date: ${session.simulation_end_date}

    Total Amount of calls: ${userInfo.callhistory_limit - userInfo.calc_fail_amount}
    Amount of rugs: ${userInfo.calc_rugs_amount}
    Rug risk %: ${roundDecimal(userInfo.calc_rugs_amount * 100 /userInfo.callhistory_limit, 2)}`

    instance.sendPhotoMessageToAuthorizedUser(session, simulation_total, null)
}

export const getBlockNumerFromTimeStamp = async (start_date, end_date) => {
    const provider = new ethers.providers.CloudflareProvider();
    const dater = new EthDater(
        provider // Ethers provider, required.
    );
    let block_data = await dater.getDate(start_date, true, false);
    let start_block = block_data.block;
    block_data = await dater.getDate(end_date, true, false);
    let end_block = block_data.block;
    return { start_block, end_block };
}
function kFormatter(num) {
    const suffixes = ["", "K", "M", "B", "T"]
    let suffixIndex = 0
    num = parseInt(Math.abs(num).toFixed(0))
    while (num >= 1000 && suffixIndex < suffixes.length - 1) {
        num = parseFloat((Math.abs(num) / 1000).toFixed(0))
        suffixIndex++
    }
    // if (isUsd) return `$${num}${suffixes[suffixIndex]}`;
    return `${num}${suffixes[suffixIndex]}`;
}

const doSimulation = async (web3, session, call_tokens) => {

    //// console.log("-------------TGR 0')
    const sessionId = session.chatid
    
    let filterProfit = {
        chat_id: sessionId,
        callhistory_limit: call_tokens.length,
        calc_fail_amount: 0,
        calc_success_amount: 0,
        calc_rugs_amount: 0,
        invest_amount: 0,
        roi_algo: 0,
        highestROI: 0,
    }

    userTotalProfit.set(sessionId, filterProfit);

    setTimeout( async () => {
        for (let i = 0; i < call_tokens.length; i ++) {
            const call_token = call_tokens[i];
            const status = await perform_simulation(web3, session, call_token, async (simul_data, calltoken) => {
                // console.log("-------------TGR 1')
                if (simul_data == null) {
                    console.log("------------------#################----------------", calltoken);
                    let userProfit = userTotalProfit.get(sessionId);
                    userProfit.calc_fail_amount += 1;
                    // instance.sendMessage(sessionId, `🚫 Sorry, error ${calltoken}`);
                } else {
                    // console.log("-------------TGR 2')
                    let liqudity_remove_message;
                    if (simul_data.rugs_liqudity_remove.transaction == 0) {
                        liqudity_remove_message = "❌ Liquidity_remove: No"
                    } else {
                        liqudity_remove_message = "❌ Liquidity_remove: Yes"
                        liqudity_remove_message += `\n     └─ transaction: <code class="text-entity-code">${simul_data.rugs_liqudity_remove.transaction}</code>`
                        const date = new Date(simul_data.rugs_liqudity_remove.blockTimestamp * 1000);
                        liqudity_remove_message += `\n     └─ time: ${date.toLocaleString()}`
                    }
                    // let impact_message;
                    // if (simul_data.rugs_impact.length == 0) {
                    //     impact_message = "❗ Impact Info: No"
                    // } else {
                    //     impact_message = "❗ Impact Info: Yes"
                    //     for (const impact_info of simul_data.rugs_impact) {
                    //         impact_message += `\n   └─ impact info`
                    //         const date = new Date(impact_info.impact_blocktimestamp * 1000);
                    //         impact_message += `\n     └─ time: ${date.toLocaleString()}`
                    //         impact_message += `\n     └─ %: ${impact_info.impact_percent}`
                    //     }
                    // }
                    let roi_message;
                    roi_message = "ROI :"
                    for (const roi of simul_data.ROI) {
                        roi_message += ` ${roi}%`
                    }
                    const token_info = await getTokenInfo(calltoken.token_address)
                    const base_info = await getTokenInfo(calltoken.base_address)
                    // console.log("#################################")
                    // console.log(simul_data.highestPrice);
                    // console.log(simul_data.startPrice);
                    const highest_potential_profit = simul_data.startPrice == 0 ? simul_data.startPrice : (simul_data.highestPrice - simul_data.startPrice) / simul_data.startPrice
                    const highest_potential_profit_value = simul_data.invest_eth * highest_potential_profit;
                    const current_potential_profit = simul_data.ROI.length == 0? 0 : simul_data.ROI[simul_data.ROI.length - 1];
                    const current_potential_profit_value = simul_data.invest_eth * current_potential_profit;

                    if (highest_potential_profit_value > 100 || (current_potential_profit_value > 100)){
                        let userProfit = userTotalProfit.get(sessionId);
                        userProfit.calc_fail_amount += 1;
                        calcTotalProfit(sessionId);
                        // console.log("-------------TGR 2.1')
                        return;
                    }
                    let highest_content = ""
                    if (current_potential_profit <= highest_potential_profit){
                        highest_content = `Highest ROI: (${simul_data.invest_eth} x ${roundDecimal(highest_potential_profit, 3)}): ${roundDecimal(highest_potential_profit_value, 3)} ${afx.get_chain_symbol()}`
                    }
                    const ethPrice = await getEthPrice(web3);
                    const lastSellTime = simul_data.sell_points.length == 0? new Date() : new Date(simul_data.sell_points[simul_data.sell_points.length - 1] * 1000);
                    const simulation_settings = `
    <u>Simulation Result</u>
    ⚡ Token Info: ${token_info.name} ${base_info.symbol}/${token_info.symbol}
    🏠 Token address: <code class="text-entity-code">${token_info.address}</code>
        Marketcap called: $ ${kFormatter(simul_data.firstMarketcap * ethPrice)}
        Initial investment: ${simul_data.invest_eth} ${afx.get_chain_symbol()}
        Marketcap all time high: $ ${kFormatter(simul_data.highestMarketcap * ethPrice)}
        ${highest_content}
        ROI with Algo (Tx & Swap Fee): (${simul_data.invest_eth} x ${roundDecimal(current_potential_profit, 3)}): ${roundDecimal(current_potential_profit_value, 3)} ${afx.get_chain_symbol()} net profit 
        Time: ${lastSellTime.toLocaleString()}
        ${liqudity_remove_message}
        📊 Chart: <a href="https://www.dextools.io/app/en/ether/pair-explorer/${calltoken.pair_address}">DexTools</a>`

                    instance.sendPhotoMessageToAuthorizedUser(session, simulation_settings, null)
                    // instance.sendMessage(sessionId, simulation_settings);
                    let userProfit = userTotalProfit.get(sessionId);
                    if (simul_data.rugs_liqudity_remove.transaction == 0){
                        userProfit.calc_success_amount += 1;
                    }else{
                        userProfit.calc_rugs_amount += 1;
                    }
                    userProfit.highestROI += highest_potential_profit_value;
                    userProfit.invest_amount += simul_data.invest_eth;
                    userProfit.roi_algo += current_potential_profit_value;
                }
                calcTotalProfit(sessionId);
            });
            // if (!status) {
            //     i --;
            // }
        }
    }
    , 1000)
}

export const simulation = async (web3, sessionId) => {
    try {
        let session = instance.sessions.get(sessionId)
        if (!session) {
            instance.sendMessage(sessionId, `Sorry you are removed from the bot`)
            return null
        }

        if (!session.simulation_start_date || !session.simulation_end_date) {
            instance.sendMessage(sessionId, `Parameter incorrect`)
            return null
        }

        let start_time = Math.floor(session.simulation_start_date / 1000)
        let end_time = Math.floor(session.simulation_end_date / 1000)

        const duration = (end_time - start_time) / (60 * 60 * 24 * 30);//1 month
        if ((start_time > end_time) || (duration > 1)) {
            instance.sendMessage(sessionId, `Sorry you have to set period 1 month or less`)
            return null
        }

        if (session.simulation_invest_amount <= 0) {
            instance.sendMessage(sessionId, `Sorry invalid investment`)
            return null
        }

        let call_tokens = await getCallHistory(session, start_time * 1000, end_time * 1000);
        if (call_tokens.length == 0) {
            instance.sendMessage(sessionId, `Sorry don't exist bot call`);
        }

        doSimulation(web3, session, call_tokens)

    } catch (error) {
        console.log('error', error);
        return null
    }
}

export const simulationOne = async (web3, sessionId, tokenAddress) => {
    try {

        let session = instance.sessions.get(sessionId)
        if (!session) {
            instance.sendMessage(sessionId, `Sorry you are removed from the bot`)
            return null
        }

        let start_time = Math.floor(session.simulation_start_date / 1000)
        let end_time = Math.floor(session.simulation_end_date / 1000)
        const duration = (end_time - start_time) / (60 * 60 * 24 * 30);//1 month

        if ((start_time > end_time) || (duration > 1)) {
            instance.sendMessage(sessionId, `Sorry you have to set period 1 month or less`)
            return null
        }

        if (session.simulation_invest_amount <= 0) {
            instance.sendMessage(sessionId, `Sorry invalid investment`)
            return null
        }
        
        const pairInfo = await advUtils.getInitialPoolInfo(web3, tokenAddress, 'v2')
        if (!pairInfo || !pairInfo.timestamp) {
            instance.sendMessage(sessionId, `The token contract has not Uniswap V2 pair or invalid`)
            return
        }

        if (start_time < Number(pairInfo.timestamp)) {
            start_time = Number(pairInfo.timestamp)
        }

        let call_tokens = [ {

            chatid: sessionId,
            token_address: tokenAddress,
            base_address: afx.get_weth_address(),
            pair_address: pairInfo.poolAddress,
            primaryIndex: 0,
            timestamp: start_time * 1000,
            initialLiquidity: 0,
            freshWalletCount: 0,
            whaleWalletCount: 0,
            kycWalletCount: 0,
            dormantWalletCount: 0,
            lp_lock: 0,
            honeypot: 0
        }]

        doSimulation(web3, session, call_tokens)

    } catch (error) {
        console.log('error', error);
        return null
    }
}

export const perform_simulation = async (web3, session, call_token, callback) => {
    let reserve0 = 0;
    let reserve1 = 0;
    const start_time = Math.floor(Number(call_token.timestamp) / 1000);
    const current_date = new Date();
   
    let end_time = Math.floor(session.simulation_end_date / 1000);

    if (session.simulation_end_date > current_date.getTime()) {
        end_time = Math.floor(current_date.getTime() / 1000);
    }

    // console.log(`calltime = ${call_token.timestamp} start_time = ${start_time}, end_time = ${end_time} current_date = ${current_date}`)
    let trailing_lose_data = {
        invest_eth: session.simulation_invest_amount,
        profit_target: session.simulation_profit_target,
        trailing_stop_loss: session.simulation_trailing_stop_loss,
        trailing_stop: 0,
        owned_tokens: 0,
        delta_tokens: 0,
        owned_eths: session.simulation_invest_amount,
        delta_eths: 0,
        buyable_eth: session.simulation_invest_amount,
        highestPrice: 0,
        firstMarketcap: 0,
        startPrice: 0,
        highestMarketcap: 0,
        rugs_liqudity_remove: {
            transaction: 0,
            blockTimestamp: 0,
        },
        rugs_impact: [],
        buy_sell_mode: "buy",
        ROI: [],
        buy_points: [],
        sell_points: [],
        isETH: 1,
        sell_eth: 0,
    }
    let last_timestamp = start_time;
    
    // console.log(call_token)
    const token0_info = await getTokenInfo(call_token.base_address);
    const token1_info = await getTokenInfo(call_token.token_address);

    // // console.log("-------------TGR 4", start_time)
    let start_block_number = await getBlockNumberByTimestamp(start_time);
    if (start_block_number == null){
        console.log("block_number calculation error")
        callback(null, 'block_number calculation error'); 
        return false;
    }

    // // console.log("-------------TGR 5")
    start_block_number = Number(start_block_number);
    let last_block_number = start_block_number;

    let transactionHash = 0;
    const ethPrice = await getEthPrice(web3)
    // // console.log("-------------TGR 6", ethPrice)
   try {
        let poolContract = new web3.eth.Contract(afx.get_uniswapv2_pool_abi(), call_token.pair_address)
        //let last_block = 0;
        // // console.log("-------------TGR 7")
        let index = 0;
        if (token0_info.symbol === 'USDT' || token0_info.symbol === 'USDC') {
            trailing_lose_data.invest_eth = Number(trailing_lose_data.invest_eth) * ethPrice;
            trailing_lose_data.owned_eths = trailing_lose_data.invest_eth;
            trailing_lose_data.buyable_eth = trailing_lose_data.invest_eth;
            trailing_lose_data.isETH = 0;
        }
        // console.log(`start_block = ${start_block}, token0_info=${token0_info.name}. token1_info=${token1_info.name}`)
        while (last_timestamp <= end_time) {

            // // console.log("-------------TGR 7.1", last_timestamp, end_time)
            let reserveList = [];
            //let swapList = [];
           //console.log(`loop#########, ${index}, lastTime = ${last_timestamp}, end_time=${end_time})`)
           last_block_number = start_block_number + Number(process.env.SIMULATION_GET_BLOCK_THRESHOLD);
            // if (last_block > end_block)
            //     last_block = end_block;
            let events = await poolContract.getPastEvents('Sync',
                {
                    fromBlock: start_block_number,
                    toBlock: last_block_number,
                },);
            // (err, events) => {
            //     console.log(events);
            // });
            if (events.length == 0) {
                last_timestamp = await getBlockTimeStampFromBlockNumber(web3, last_block_number);
                let currentDate = new Date()
                if ((last_timestamp + 60 * 10) > currentDate.getTime() / 1000) {
                    waitBlock(web3, Number(process.env.SIMULATION_GET_BLOCK_THRESHOLD));
                } else {
                    sleep(1000)
                }
                start_block_number = last_block_number + 1;
                continue;
            }

            for (const event of events) {
                reserve0 = call_token.primaryIndex == 0 ? event.returnValues.reserve1 : event.returnValues.reserve0;
                reserve0 = Number(reserve0) / (10 ** token0_info.decimal);
                reserve1 = call_token.primaryIndex == 0 ? event.returnValues.reserve0 : event.returnValues.reserve1;
                reserve1 = Number(reserve1) / (10 ** token1_info.decimal);
                reserveList.push({
                    reserve0: reserve0,
                    reserve1: reserve1,
                    transactionHash: event.transactionHash,
                    blockNumber: event.blockNumber
                });
                transactionHash = event.transactionHash
            }

            sleep(1000)
            // events = await poolContract.getPastEvents('Swap',
            //     {
            //         fromBlock: start_block_number,
            //         toBlock: last_block_number,
            //     },);

            // (err, events) => {
            //     console.log(events);
            // });
            // for (const event of events) {
            //     const amount0In = call_token.primaryIndex == 0 ? event.returnValues.amount1In : event.returnValues.amount0In;
            //     const amount0Out = call_token.primaryIndex == 0 ? event.returnValues.amount1Out : event.returnValues.amount0Out;
            //     const amount1In = call_token.primaryIndex == 0 ? event.returnValues.amount0In : event.returnValues.amount1In;
            //     const amount1Out = call_token.primaryIndex == 0 ? event.returnValues.amount0Out : event.returnValues.amount1Out;
            //     swapList.push({
            //         amount0In: amount0In / (10 ** token0_info.decimal),
            //         amount0Out: amount0Out / (10 ** token0_info.decimal),
            //         amount1In: amount1In / (10 ** token1_info.decimal),
            //         amount1Out: amount1Out / (10 ** token1_info.decimal),
            //         transactionHash: event.transactionHash,
            //         blockNumber: event.blockNumber
            //     });
            // }

            if (index == 0) {
                const start_price = Number(reserveList[0].reserve0) / Number(reserveList[0].reserve1);
                trailing_lose_data.firstMarketcap = start_price * token1_info.totalSupply;
                if (trailing_lose_data.firstMarketcap == 0){
                    console.log(`${call_token.pair_address} pool is empty`);
                    callback(null, `pool is empty`);
                    return true;
                }
                trailing_lose_data.trailing_stop_loss = start_price * trailing_lose_data.trailing_stop_loss/ 100;
                trailing_lose_data.trailing_stop = start_price + trailing_lose_data.trailing_stop_loss;
                trailing_lose_data.startPrice = start_price;
                // invest_tokens = invest_eth * (Number(poolInfoList[0].reserve1) / Number(poolInfoList[0].reserve0));
                // owned_tokens = invest_tokens;
                // trailing_stop = start_price * profit_target;
                //console.log(`start_price=${start_price} base = ${token0_info.address} token=${token1_info.address}`);
            }
            let analysis_info = await tailing_stop_algo(web3, trailing_lose_data, reserveList, token0_info, token1_info);
            trailing_lose_data = analysis_info;
            if (trailing_lose_data.rugs_liqudity_remove.transaction != 0) {
                break;
            }
            start_block_number = last_block_number + 1;
            last_timestamp = await getBlockTimeStampFromBlockNumber(web3, last_block_number);
            index++;
            sleep(1000)
        }

        // // console.log("-------------TGR 8")
        if (trailing_lose_data.owned_tokens != 0){
            let minusflag_eth = trailing_lose_data.delta_eths > 0 ? 1 : -1;
            let minusflag_token = trailing_lose_data.delta_tokens > 0 ? 1 : -1;
            let new_reserve0 = Number(reserve0) + minusflag_eth * Number(minusflag_eth * trailing_lose_data.delta_eths);
            let new_reserve1 = Number(reserve1) + minusflag_token * Number(minusflag_token * trailing_lose_data.delta_tokens);

            let out_eth = getAmountOut(trailing_lose_data.owned_tokens, new_reserve1, new_reserve0)
            const txData = await web3.eth.getTransaction(transactionHash)
            const fee = txData.gasPrice * txData.gas;
            let feeEth = Number(web3.utils.fromWei(String(fee), 'ether'));
            if (trailing_lose_data.isETH == 0){
                feeEth = feeEth * ethPrice;
            }
            out_eth -= feeEth;
            if (out_eth < 0){
                out_eth = 0;
            }

            console.log(`time limit sell price = ${reserve0 / reserve1}, tokens= ${trailing_lose_data.owned_tokens}`)
            trailing_lose_data.owned_eths += out_eth;
            trailing_lose_data.ROI.push((trailing_lose_data.owned_eths - trailing_lose_data.invest_eth) / trailing_lose_data.invest_eth);
            trailing_lose_data.sell_points.push(last_timestamp)
          //  console.log(`sell point owned_eths = ${trailing_lose_data.owned_eths}, owned_tokens = ${trailing_lose_data.owned_tokens} current_price = ${reserve0/reserve1}`)
        }

        if (token0_info.symbol === 'USDT' || token0_info.symbol === 'USDC') {
            trailing_lose_data.invest_eth = Number(trailing_lose_data.invest_eth) / ethPrice;
            trailing_lose_data.owned_eths = Number(trailing_lose_data.owned_eths) / ethPrice;
            trailing_lose_data.buyable_eth = Number(trailing_lose_data.buyable_eth) / ethPrice;
            trailing_lose_data.highestPrice = Number(trailing_lose_data.highestPrice) / ethPrice;
            trailing_lose_data.startPrice = Number(trailing_lose_data.startPrice) / ethPrice;
            trailing_lose_data.highestMarketcap = Number(trailing_lose_data.highestMarketcap) / ethPrice;
            trailing_lose_data.firstMarketcap = Number(trailing_lose_data.firstMarketcap) / ethPrice;
        }

        // // console.log("-------------TGR 9")
        if (trailing_lose_data.startPrice == 0) {
            callback(null, call_token);
        } else {
            callback(trailing_lose_data, call_token);
        }

        return true;

    } catch (error) {

        // // console.log("-------------TGR 10")
        if (trailing_lose_data.startPrice == 0){
            console.log(error)
            callback(null, `${error}`);
            return false;
        }

        if (trailing_lose_data.owned_tokens != 0){
            let minusflag_eth = trailing_lose_data.delta_eths > 0 ? 1 : -1;
            let minusflag_token = trailing_lose_data.delta_tokens > 0 ? 1 : -1;
            let new_reserve0 = Number(reserve0) + minusflag_eth * Number(minusflag_eth * trailing_lose_data.delta_eths);
            let new_reserve1 = Number(reserve1) + minusflag_token * Number(minusflag_token * trailing_lose_data.delta_tokens);
            let out_eth = getAmountOut(trailing_lose_data.owned_tokens, new_reserve1, new_reserve0)
            const txData = await web3.eth.getTransaction(transactionHash)
            const fee = txData.gasPrice * txData.gas;
            let feeEth = Number(web3.utils.fromWei(String(fee), 'ether'));
            if (trailing_lose_data.isETH == 0){
                feeEth = feeEth * ethPrice;
            }
            out_eth -= feeEth;
            if (out_eth < 0){
                out_eth = 0;
            }

            trailing_lose_data.owned_eths += out_eth;
            trailing_lose_data.ROI.push((trailing_lose_data.owned_eths - trailing_lose_data.invest_eth) / trailing_lose_data.invest_eth);
            trailing_lose_data.sell_points.push(last_timestamp)
           // console.log(`sell point owned_eths = ${trailing_lose_data.owned_eths}, owned_tokens = ${trailing_lose_data.owned_tokens} current_price = ${reserve0/reserve1}`)
        }
        if (token0_info.symbol === 'USDT' || token0_info.symbol === 'USDC') {
            trailing_lose_data.invest_eth = Number(trailing_lose_data.invest_eth) / ethPrice;
            trailing_lose_data.owned_eths = Number(trailing_lose_data.owned_eths) / ethPrice;
            trailing_lose_data.buyable_eth = Number(trailing_lose_data.buyable_eth) / ethPrice;
            trailing_lose_data.highestPrice = Number(trailing_lose_data.highestPrice) / ethPrice;
            trailing_lose_data.startPrice = Number(trailing_lose_data.startPrice) / ethPrice;
            trailing_lose_data.highestMarketcap = Number(trailing_lose_data.highestMarketcap) / ethPrice;
            trailing_lose_data.firstMarketcap = Number(trailing_lose_data.firstMarketcap) / ethPrice;
        }

        callback(trailing_lose_data, call_token);
        return true;
    }
}
function getAmountOut(amountIn, reserveIn, reserveOut) {
    const amountInWithFee = amountIn * 997;
    const numerator = amountInWithFee * reserveOut;
    const denominator = reserveIn * 1000 + amountInWithFee;
    const amountOut = numerator / denominator;
    return amountOut;
}
export const tailing_stop_algo = async (web3, trailing_lose_data, reserveList, token0_info, token1_info) => {
    let user_data = trailing_lose_data;
    try {
        let prev_pool_info = reserveList[0];
        //let pre_price = user_data.trailing_stop;
        let prev_reserve0 = prev_pool_info.reserve0;
        let prev_reserve1 = prev_pool_info.reserve1;
        for (const poolInfo of reserveList) {
            // if ((poolInfo.reserve0 / prev_pool_info.reserve0) < 0.15) {
            //     for (const swapInfo of swapList) {
            //         if (poolInfo.transactionHash == swapInfo.transactionHash) {
            //             let impact_percent = 0;
            //             impact_percent = swapInfo.amount0In * 100 / poolInfo.reserve0;
            //             let timestamp = await getBlockTimeStampFromBlockNumber(poolInfo.blockNumber);
            //             impact_percent = roundDecimal(impact_percent, 1);
            //             if (impact_percent > 15) {
            //                 user_data.rugs_impact.push({ impact_blocktimestamp: timestamp, impact_percent: `${impact_percent} %` })
            //                 break;
            //             }
            //             impact_percent = swapInfo.amount1In * 100 / poolInfo.reserve1;
            //             impact_percent = roundDecimal(impact_percent, 1);
            //             if (impact_percent > 15) {
            //                 user_data.rugs_impact.push({ impact_blocktimestamp: timestamp, impact_percent: `${impact_percent} %` })
            //                 break;
            //             }
            //         }
            //     }
            // }
            
            let minusflag_eth = user_data.delta_eths > 0 ? 1 : -1;
            let minusflag_token = user_data.delta_tokens > 0 ? 1 : -1;
            let new_reserve0 = Number(poolInfo.reserve0) + minusflag_eth * Number(minusflag_eth * user_data.delta_eths);
            let new_reserve1 = Number(poolInfo.reserve1) + minusflag_token * Number(minusflag_token * user_data.delta_tokens);
            if ((new_reserve0 < 0) || (new_reserve1 < 0)) {
                user_data.trailing_stop = 0;
                break;
            }
            let price = new_reserve0 / new_reserve1;//reserve0 WETH, reserve1 Token

            if (user_data.highestPrice < price) {
                user_data.highestPrice = price;
                user_data.highestMarketcap = user_data.highestPrice * token1_info.totalSupply;//must current totalSupply
            }
            if (user_data.trailing_stop == 0) {
                continue;
            }
            if ((poolInfo.reserve0 / prev_pool_info.reserve0) < 0.01) {
                let timestamp = await getBlockTimeStampFromBlockNumber(web3, poolInfo.blockNumber);
                user_data.rugs_liqudity_remove = { transaction: poolInfo.transactionHash, blockTimestamp: timestamp }
                user_data.trailing_stop = 0;
                let buy_eth = getAmountOut(user_data.owned_tokens, prev_reserve1, prev_reserve0);

                const txData = await web3.eth.getTransaction(poolInfo.transactionHash)
                const fee = txData.gasPrice * txData.gas;
                let feeEth = Number(web3.utils.fromWei(String(fee), 'ether'));
                if (trailing_lose_data.isETH == 0){
                    feeEth = feeEth * ethPrice;
                }
                buy_eth -= feeEth;
                if (buy_eth < 0){
                    buy_eth = 0;
                }

                user_data.delta_tokens += user_data.owned_tokens;
                user_data.owned_eths += buy_eth;
                user_data.delta_eths -= buy_eth;
                user_data.owned_tokens = 0;
                user_data.trailing_stop = 0;
                const sell_time = await getBlockTimeStampFromBlockNumber(web3, prev_pool_info.blockNumber);
                user_data.sell_points.push(sell_time);
                user_data.ROI.push((user_data.owned_eths - user_data.invest_eth) / user_data.invest_eth);
                console.log(`point liquidity_remove_risk pre_reserve0 = ${prev_pool_info.reserve0} cur_reserve0 = ${poolInfo.reserve0}`)
                break;

            }
            
            if ((price >= (user_data.trailing_stop + user_data.trailing_stop_loss)) && (user_data.buy_sell_mode == "sell")) {
                user_data.trailing_stop = price - user_data.trailing_stop_loss;
                //console.log(`stop_lose_up = ${user_data.trailing_stop}`)
            } else if ((price <= user_data.trailing_stop) && (user_data.buy_sell_mode == "sell")) {
                let sell_token = user_data.owned_tokens;//(user_data.owned_tokens < 2) ? user_data.owned_tokens : user_data.owned_tokens / 2;
                //let buy_eth = getAmountOut(sell_token, prev_reserve1, prev_reserve0);
                let buy_eth = getAmountOut(sell_token, new_reserve1, new_reserve0);

                const txData = await web3.eth.getTransaction(poolInfo.transactionHash)
                const fee = txData.gasPrice * txData.gas;
                let feeEth = Number(web3.utils.fromWei(String(fee), 'ether'));
                if (trailing_lose_data.isETH == 0){
                    feeEth = feeEth * ethPrice;
                }
                const temp_eth = user_data.delta_eths - buy_eth;
                buy_eth -= feeEth;
                if (buy_eth <= user_data.sell_eth){
                    continue;
                }
                if (buy_eth < 0){
                    user_data.trailing_stop = 0;
                    continue;
                }

                if (Math.abs(temp_eth) > Math.abs(new_reserve0)) {
                    temp_eth = new_reserve0;
                    user_data.trailing_stop = 0;
                }
                user_data.owned_eths += buy_eth;
                user_data.delta_tokens = user_data.delta_tokens + sell_token;
                user_data.delta_eths = temp_eth;
                user_data.owned_tokens = user_data.owned_tokens - sell_token;
                // if (user_data.owned_tokens == 0) {
                //     user_data.trailing_stop = 0;
                // }
                user_data.buyable_eth = user_data.owned_eths / 2;//pre_price * sell_token / 2;

                user_data.buy_sell_mode = "buy";
                const sell_time = await getBlockTimeStampFromBlockNumber(web3, poolInfo.blockNumber);
                user_data.sell_points.push(sell_time);
                user_data.ROI.push((user_data.owned_eths - user_data.invest_eth) / user_data.invest_eth);
                if (user_data.owned_eths > (user_data.invest_eth * user_data.profit_target)) {
                    user_data.trailing_stop = 0;
                }
                //user_data.ROI.push(roundDecimal(((user_data.owned_eths + user_data.owned_tokens * pre_price) - user_data.invest_eth) * 100 / user_data.invest_eth, 1));
               // console.log(`sell point owned_eths = ${user_data.owned_eths}, owned_tokens = ${user_data.owned_tokens} current_price = ${price}`)
            } else if ((price <= (user_data.trailing_stop - user_data.trailing_stop_loss)) && (user_data.buy_sell_mode == "buy")) {
                user_data.trailing_stop = price + user_data.trailing_stop_loss;
                //console.log(`stop_lose_down = ${user_data.trailing_stop}`)
            } else if ((price >= user_data.trailing_stop) && (user_data.buy_sell_mode == "buy")) {
                //let buy_tokens = getAmountOut(user_data.buyable_eth, prev_reserve0, prev_reserve1);//user_data.buyable_eth / pre_price;
                const txData = await web3.eth.getTransaction(poolInfo.transactionHash)
                const fee = txData.gasPrice * txData.gas;
                let feeEth = Number(web3.utils.fromWei(String(fee), 'ether'));
                if (trailing_lose_data.isETH == 0){
                    feeEth = feeEth * ethPrice;
                }

                if (user_data.buyable_eth < feeEth){
                    user_data.trailing_stop = 0;
                    continue;
                }

                let buy_tokens = getAmountOut((user_data.buyable_eth - feeEth), new_reserve0, new_reserve1);
                user_data.delta_tokens -= buy_tokens;
                if (Math.abs(user_data.delta_tokens) > new_reserve1) {
                    user_data.trailing_stop = 0;
                    continue;
                }
                user_data.owned_tokens = user_data.owned_tokens + buy_tokens;

                user_data.owned_eths -= user_data.buyable_eth;
                user_data.delta_eths += (user_data.buyable_eth - feeEth);
                // if (trailing_lose_data.startPrice == 0){
                //     trailing_lose_data.startPrice = price;
                // }
                user_data.buy_points.push(poolInfo.transactionHash);//buy strategy
                user_data.sell_eth = user_data.buyable_eth;
                user_data.buy_sell_mode = "sell";
                //console.log(`buy point owned_eths = ${user_data.owned_eths}, owned_tokens = ${user_data.owned_tokens} buyable_eth = ${user_data.buyable_eth} current_price = ${price}`)
            } else {
                //console.log(`else trailing_stop = ${user_data.trailing_stop}, current price = ${price}`)
            }
            prev_pool_info = poolInfo;
            prev_reserve0 = new_reserve0;
            prev_reserve1 = new_reserve1;
            //pre_price = price;
        }
    } catch (error) {
        console.error(error);
    }
    return user_data;
}