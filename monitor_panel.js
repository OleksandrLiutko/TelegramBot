import * as utils from './utils.js'
import { UNISWAP_V2_ROUTER_ABI } from "./abi/uniswapv2-router-abi.js"
import { UNISWAP_V3_ROUTER_ABI } from "./abi/uniswapv3-router-abi.js"
import * as uniconst from './uni-catch/const.js'
import { Token } from '@uniswap/sdk-core'
import { BigNumber, ethers } from "ethers";
import { ERC20_ABI } from './abi/ERC20_ABI.js'
import * as ethscan_api from './etherscan-api.js'
import * as tokenAnalyzer from './token_analyzer.js'
import * as afx from './global.js'
import * as advUtils from './adv_utils.js'

import dotenv from 'dotenv'
import { startSession } from 'mongoose'
dotenv.config()

export const LOG_SWAP_V2_KECCACK = '0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822'
export const LOG_SWAP_V3_KECCACK = '0xc42079f94a6350d7e6235f29174924f928cc2ac818eb64fed8004e115fbcca67'

export const getInfoFromSwapTxHash = async (web3, txHash) => {

    let poolAddress = '', version = '', timestamp = 0, gasPrice = 0, wallet = ''

    var receipt = await web3.eth.getTransactionReceipt(txHash)
    if (receipt && receipt.logs) {
        for (const log of receipt.logs) {
            const logCode = log.topics[0]?.toLowerCase()
            if (logCode === LOG_SWAP_V2_KECCACK) {
                poolAddress = log.address
                version = 'v2'
                break
            } else if (logCode === LOG_SWAP_V3_KECCACK) {
                poolAddress = log.address
                version = 'v3'
                break
            }
        }

        const blockInfo = await web3.eth.getBlock(receipt.blockNumber)
        if (blockInfo) {
            timestamp = blockInfo.timestamp
        }

        gasPrice = receipt.effectiveGasPrice / (10 ** 9)
        wallet = receipt.from
    }

    return {poolAddress, version, timestamp, gasPrice, wallet}
}

export const investigate = async (web3, txHash, tokenName, tokenAddress, tokenPrice, tokenSupply, buyAmount, boughtTokenAmount, callback) => {

console.log("===================investigate start===================")
if (!tokenPrice || !buyAmount) {
        return
    }

    try {
console.log("===================investigate getTokenTax===================")
        const {buyTax, sellTax} = await advUtils.getTokenTax(web3, [afx.get_weth_address(), tokenAddress.toLowerCase()])
console.log("===================investigate getTokenPrice===================")
        const currentTokenPrice = await utils.getTokenPrice(web3, tokenAddress.toLowerCase())
        const tokenWorth = buyAmount * currentTokenPrice / tokenPrice

        const tx = await web3.eth.getTransaction(txHash)
        if (!tx) {
            return
        }

        const blockInfo = await web3.eth.getBlock(tx.blockNumber)
        const currentBlockInfo = await web3.eth.getBlock('latest')

        const totalSecs = currentBlockInfo.timestamp - blockInfo.timestamp
        const timeElapsed = utils.getFullTimeElapsedFromSeconds(totalSecs)
        const profitOrLossPercent = (tokenWorth - buyAmount) * 100 / buyAmount
        const timeLeft = utils.getFullMinSecElapsedFromSeconds(afx.TradingMonitorDuration - totalSecs)

        const profitOrLossTaxedPercent = (tokenWorth - buyAmount) * (100 - sellTax) / buyAmount
        const priceImpact = await utils.getPriceImpact(web3, tokenAddress, boughtTokenAmount)
        const ethPrice = await utils.getEthPrice(web3)
        const currentTokenPriceInUSD = currentTokenPrice * ethPrice
        const currentMarketCap = currentTokenPriceInUSD * tokenSupply / 1000

        const expectedPayout = buyAmount * (1 + profitOrLossTaxedPercent) * (1 + priceImpact)
// { <a href="${utils.getFullTxLink(afx.get_chain_id(), txHash)}"> </a>}
        const message = `📌 Trade Monitor

Token Name: <b>${tokenName}</b> (P/W: <b>${utils.sRoundDecimal(profitOrLossPercent, 2)}%</b>, Time left: <b>${timeLeft}</b>)
Token Address: <code>${tokenAddress}</code>
Initial: <b>${utils.roundEthUnit(buyAmount)}</b>
Worth: <b>${utils.roundEthUnit(tokenWorth)}</b>
Time elapsed: <b>${timeElapsed}</b>

Price: <b>$${utils.roundDecimal(currentTokenPriceInUSD, 9)} | $${utils.roundDecimal(currentMarketCap, 2)}K</b>

Taxes:
<b>  └─ Buy: ${utils.roundDecimal(buyTax, 1)}%</b>
<b>  └─ Sell: ${utils.roundDecimal(sellTax, 1)}%</b>

P/L w/tax: ${utils.sRoundDecimal(profitOrLossTaxedPercent, 2)}%
Price Impact: ${utils.sRoundDecimal(priceImpact, 10)}%
Expected Layout: ${utils.roundEthUnit(expectedPayout)}%

Token Balance:
Other Trades:
|OtherTrades|
Use ⬅️ | ➡️ to switch between multiple trades`

// console.log(message)

        // let result = {
        //     wallet: info.wallet,
        //     tokenName: primaryInfo.name,
        //     initialLiquidity,
        //     currentLiquidity,
        //     initialTimestamp: tokenInfo.timestamp,
        //     tokenAddress: tokenInfo.primaryAddress,
        //     decimal: primaryInfo.decimal
        // }

        if (callback) {
            callback(message)
        }

    } catch (error) {
        console.log('monitor_panel.investigate', error, afx.parseError(error))
    }
    
}

