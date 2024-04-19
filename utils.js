import Web3 from 'web3'
import EventEmitter from 'events'
import axios from 'axios'
import { ERC20_ABI } from './abi/ERC20_ABI.js'
import { UNICRYPT_ABI } from './abi/unicrypt-abi.js'
import { PINKLOCK_ABI } from './abi/pinklock-abi.js'
import { TEAMFINANCE_ABI } from './abi/teamfinance-abi.js'
import { UNISWAP_V2_POOL_ABI } from './abi/uniswapv2-pool-abi.js'
import { UNISWAP_V3_POOL_ABI } from './abi/uniswapv3-pool-abi.js'
import { PANCAKESWAP_V2_POOL_ABI } from './abi/pancakeswapv2-pool-abi.js'
import { CHAINLINK_ETH_USD_PRICE_ABI } from './abi/chainlink-eth-usd-price.abi.js'
import { UNISWAP_V2_FACTORY_ABI } from './abi/uniswapv2-factory-abi.js'
import { UNISWAP_V3_FACTORY_ABI } from './abi/uniswapv3-factory-abi.js'
import * as fs from 'fs'
import * as uniconst from './uni-catch/const.js'

import assert from 'assert';
import * as afx from './global.js'
import { application } from 'express';
import * as ethscan_api from './etherscan-api.js'
import * as ethUtil from 'ethereumjs-util'
import * as bip39 from 'bip39'


import { BigNumber, ethers, utils, Wallet, Contract } from "ethers";

import * as crypto from './aes.js'
import { Concurrencer } from './concurrencer.js'

import dotenv from 'dotenv'
dotenv.config()

export let web3Inst = null
export let web3HttpInst = null

export const init = async (web3, web3Http) => {
    web3Inst = web3;
    web3HttpInst = web3Http;
}

export const isValidWalletAddress = (walletAddress) => {
    // The regex pattern to match a wallet address.
    const pattern = /^(0x){1}[0-9a-fA-F]{40}$/;

    // Test the passed-in wallet address against the regex pattern.
    return pattern.test(walletAddress);
}

export const getTokenBalanceFromWallet = async (web3, walletAddress, tokenAddress) => {

    if (tokenAddress === 0) {
        return await web3.eth.getBalance(walletAddress) / (10 ** 18);
    }

    let tokenContract = null;
    try {
        tokenContract = new web3.eth.Contract(afx.get_ERC20_abi(), tokenAddress);
    } catch (error) {
        afx.error_log('getTokenBalanceFromWallet 1', error)
        return -1
    }

    if (!tokenContract) {
        return -1;
    }

    try {
        const balance = await tokenContract.methods.balanceOf(walletAddress).call();
        const decimals = await tokenContract.methods.decimals().call();
        const tokenBalance = Number(balance) / 10 ** Number(decimals);

        return tokenBalance;

    } catch (error) {
        afx.error_log('getTokenBalanceFromWallet 2', error)
    }

    return -1;
    //console.log(`getTokenBalanceFromWallet(wallet = ${walletAddress} token = ${tokenAddress})`, "Token Balance:", tokenBalance);

}


export const isValidAddress = (address) => {
    // Check if it's 20 bytes
    if (!address) {
        console.log("Check if it's 20 bytes-false")
        return false
    }

    if (address.length !== 42) {
        console.log("Check if address.length 42 bytes-false")
        return false;
    }

    // Check that it starts with 0x
    if (address.slice(0, 2) !== '0x') {
        return false;
    }

    // Check that each character is a valid hexadecimal digit
    for (let i = 2; i < address.length; i++) {
        let charCode = address.charCodeAt(i);
        if (!((charCode >= 48 && charCode <= 57) ||
            (charCode >= 65 && charCode <= 70) ||
            (charCode >= 97 && charCode <= 102))) {
            return false;
        }
    }

    // If all checks pass, it's a valid address
    return true;
}

export function isValidPrivateKey(privateKey) {
    try {

        if (privateKey.startsWith('0x')) {
            privateKey = privateKey.substring(2)
        }
        const privateKeyBuffer = Buffer.from(privateKey, 'hex');
        const publicKeyBuffer = ethUtil.privateToPublic(privateKeyBuffer);
        const addressBuffer = ethUtil.pubToAddress(publicKeyBuffer);
        const address = ethUtil.bufferToHex(addressBuffer);
        return true
    } catch (error) {
        return false
    }
}

export const roundDecimal = (number, digits = 0) => {
    return number.toLocaleString('en-US', { maximumFractionDigits: digits });
}

export const roundDecimalWithUnit = (number, digits = 0, unit = '') => {
    if (!number) {
      return afx.NOT_ASSIGNED
    }
    return number.toLocaleString('en-US', {maximumFractionDigits: digits}) + unit;
}

export const sRoundDecimal = (number, digits = 0) => {

    let result = roundDecimal(number, digits)
    return number > 0 ? `+${result}` : result
}

export const roundEthUnit = (number, digits = 5) => {

    if (Math.abs(number) >= 0.00001) {
        return `${roundDecimal(number, digits)} ${afx.get_chain_symbol()}`
    }

    number *= 1000000000

    if (Math.abs(number) >= 0.00001) {
        return `${roundDecimal(number, digits)} GWEI`
    }

    number *= 1000000000
    return `${roundDecimal(number, digits)} WEI`
}

export const shortenAddress = (address, length = 6) => {
    if (address.length < 2 + 2 * length) {
        return address; // Not long enough to shorten
    }

    const start = address.substring(0, length + 2);
    const end = address.substring(address.length - length);

    return start + "..." + end;
}

export const shortenString = (str, length = 8) => {

    if (length < 3) {
        length = 3
    }

    if (!str) {
        return "undefined"
    }

    if (str.length < length) {
        return str; // Not long enough to shorten
    }

    const temp = str.substring(0, length - 3) + '...';

    return temp;
}

export const getTokenInfo = async (tokenAddress) => {

    assert(web3Inst)

    return new Promise(async (resolve, reject) => {
        getTokenInfoW(web3Inst, tokenAddress).then(result => {
            resolve(result)
        })
    })
}

export const getTokenInfoW = async (web3, tokenAddress) => {

    return new Promise(async (resolve, reject) => {

        let tokenContract = null

        try {
            tokenContract = new web3.eth.Contract(afx.get_ERC20_abi(), tokenAddress);

            var tokenPromises = [];

            tokenPromises.push(tokenContract.methods.name().call());
            tokenPromises.push(tokenContract.methods.symbol().call());
            tokenPromises.push(tokenContract.methods.decimals().call());
            tokenPromises.push(tokenContract.methods.totalSupply().call());

            Promise.all(tokenPromises).then(tokenInfo => {

                const decimal = parseInt(tokenInfo[2])
                const totalSupply = Number(tokenInfo[3]) / 10 ** decimal
                const result = { address: tokenAddress, name: tokenInfo[0], symbol: tokenInfo[1], decimal, totalSupply }

                resolve(result)

            }).catch(err => {

                //console.log(err)
                resolve(null)
            })

        } catch (err) {

            //console.error(err)
            resolve(null)
            return
        }
    })
}

// export const getEthPrice = async (web3) => {

//     try {

//         const pairContract = new web3.eth.Contract(UNISWAP_V2_POOL_ABI, uniconst.ETH_USDT_V2_PAIR_ADDRESS);
//         let res = await pairContract.methods.getReserves().call()

//         let tokenBalance = res._reserve0
//         let baseTokenBalance = res._reserve1

//         tokenBalance = Number(tokenBalance) / 10 ** 18
//         baseTokenBalance = Number(baseTokenBalance) / 10 ** 6

//         let price =  baseTokenBalance / tokenBalance

//         return price

//     } catch (error) {
//         afx.error_log('[getEthPrice]', error)
//     }

//     return 0.0
// }

export const getEthPrice = async (web3) => {

    let web3New = web3
    if (afx.get_chain_id() === afx.GoerliTestnet_ChainId) {
        web3New = new Web3(process.env.ETHEREUM_RPC_HTTP_URL)
    }

    try {
        const chainlinkContract = new web3New.eth.Contract(CHAINLINK_ETH_USD_PRICE_ABI, afx.get_chainlink_address())
        const decimals = await chainlinkContract.methods.decimals().call()
        const price = await chainlinkContract.methods.latestAnswer().call() / (10 ** decimals)

        return price;

    } catch (error) {

        afx.error_log('[getEthPrice]', error)
        return 0.0
    }
}

export const getTimeStringUTC = (timestamp) => {

    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        timeZone: 'UTC'
    };

    const formattedDate = timestamp.toLocaleString('en-US', options);

    return formattedDate
}

export function isValidDate(dateString) {
    const date = new Date(dateString);

    // The date constructor returns 'Invalid Date' if the date string is invalid
    return date instanceof Date && !isNaN(date);
}
export const fetchAPI = async (url, method, data = {}) => {

    return new Promise(resolve => {

        if (method === "POST") {

            axios.post(url, data).then(response => {
                let json = response.data;
                resolve(json)
            }).catch(error => {

                resolve(null)
            });

        } else {

            console.log(url)
            axios.get(url).then(response => {
                let json = response.data;
                resolve(json)
            }).catch(error => {

                afx.error_log('fetchAPI', error)
                resolve(null)

            });
        }
    })
}

export const getUnicryptDetails = (web3, pairAddress) => {

    return new Promise(async (resolve, reject) => {

        let contract = null

        try {
            contract = new web3.eth.Contract(UNICRYPT_ABI, afx.get_unicrypt_address());
        } catch (err) {
            resolve(null)
            return
        }

        let numLocks = 0
        try {

            numLocks = await contract.methods.getNumLocksForToken(pairAddress).call()

            // console.log('numLocks', numLocks, pairAddress)

        } catch (err) {
            resolve(null)
            return
        }

        let resAmount = 0
        let resUnlockDate = 0
        for (let iLock = 0; iLock < numLocks; iLock++) {

            let detail = null

            try {

                detail = await contract.methods.tokenLocks(pairAddress, iLock).call()
                // console.log(detail)

            } catch (error) {

                //console.log(err)
                afx.error_log('getUnicryptDetails', error)
                continue
            }

            if (!detail) {
                continue
            }

            resAmount += Number(detail.amount)
            if (resUnlockDate < Number(detail.unlockDate)) {
                resUnlockDate = Number(detail.unlockDate)
            }
        }
        resolve({ resAmount, resUnlockDate })
    })

}

export const getPinkLockDetails = (web3, pairAddress) => {

    return new Promise(async (resolve, reject) => {

        let contract = null

        try {
            contract = new web3.eth.Contract(PINKLOCK_ABI, afx.get_pinklock_address());
        } catch (err) {
            resolve(null)
            return
        }

        let numLocks = 10
        let detail = null

        try {

            detail = await contract.methods.getLocksForToken(pairAddress, 0, numLocks).call()

        } catch (err) {
            resolve(null)
            return
        }

        if (!detail) {
            resolve(null)
            return
        }

        let resAmount = 0
        let resUnlockDate = 0
        for (const lockInfo of detail) {

            if (!lockInfo[5]) {
                continue
            }

            const unlockDate = Number(lockInfo[5])
            if (resUnlockDate < unlockDate) {
                resUnlockDate = unlockDate
            }
        }

        resolve({ resAmount, resUnlockDate })
    })

}

export const addressToHex = (address) => {
    const hexString = '0x' + address.slice(2).toLowerCase().padStart(64, '0');
    return hexString.toLowerCase();
}

export const getContractVerified = async (web3, address) => {
    if (afx.get_chain_id() == afx.Avalanche_ChainId) {
        let url = `${afx.get_apibaseurl()}?module=contract&action=getabi&address=${address}`
        const apiKey = await ethscan_api.getApiKey()
        const resp = await ethscan_api.executeEthscanAPI(url, apiKey)
        if (!resp
            || !resp.status
            || resp.message !== 'OK'
            || !resp.result
            || resp.result.length === 0) {

            return null
        }
        return '0x1111';
    } else {
        let url = `${afx.get_apibaseurl()}/api?module=contract&action=getsourcecode&address=${address}`

        const apiKey = await ethscan_api.getApiKey()
        const resp = await ethscan_api.executeEthscanAPI(url, apiKey)

        if (!resp
            || !resp.status
            || resp.status !== '1'
            || !resp.message
            || resp.message !== 'OK'
            || !resp.result
            || resp.result.length === 0
            || !resp.result[0].SourceCode || resp.result[0].SourceCode === '' || !resp.result[0].ABI || resp.result[0].ABI === 'Contract source code not verified') {

            return null
        }

        const bytecodeHash = web3.utils.keccak256(resp.result[0].SourceCode);

        const checksum = '0x' + bytecodeHash.slice(-8);

        return checksum
    }
}

export const createDirectoryIfNotExists = (directoryPath) => {
    if (!fs.existsSync(directoryPath)) {
        fs.mkdirSync(directoryPath);
        console.log(`The directory '${directoryPath}' has been created.`);
    } else {
    }
};

export const getShortenedAddress = (address) => {

    if (!address) {
        return ''
    }

    let str = address.slice(0, 24) + '...'

    return str
}

export const getWalletAddressFromPKeyW = (web3, privateKey) => {

    const account = web3.eth.accounts.privateKeyToAccount(privateKey);
    const walletAddress = account.address;

    return walletAddress
}

export const getWalletAddressFromPKey = (privateKey) => {

    if (!web3Inst) {
        return null
    }

    return getWalletAddressFromPKeyW(web3Inst, privateKey)
}

export const encryptPKey = (text) => {

    if (text.startsWith('0x')) {
        text = text.substring(2)
    }

    return crypto.aesEncrypt(text, process.env.CRYPT_KEY)
}

export const decryptPKey = (text) => {
    return crypto.aesDecrypt(text, process.env.CRYPT_KEY)
}

export const generateNewWallet = () => {

    try {
        const mnemonic = ethers.Wallet.createRandom().mnemonic;

        const wallet = ethers.Wallet.fromMnemonic(mnemonic.phrase.toString());

        const privateKey = wallet.privateKey;
        const address = wallet.address;

        return { mnemonic: mnemonic.phrase, privateKey, address }

    } catch (error) {

        console.log(error)
        return null
    }
}

export function isValidSeedPhrase(seedPhrase) {
    // Check if the seed phrase is valid
    const isValid = bip39.validateMnemonic(seedPhrase);

    return isValid;
}

export async function seedPhraseToPrivateKey(seedPhrase) {

    try {
        const wallet = ethers.Wallet.fromMnemonic(seedPhrase);

        const privateKey = wallet.privateKey;

        return privateKey;

    } catch (error) {
        return null
    }
}

export function waitForEvent(eventEmitter, eventName) {
    return new Promise(resolve => {
        eventEmitter.on(eventName, resolve)
    })
}

export async function waitSeconds(seconds) {
    const eventEmitter = new EventEmitter()

    setTimeout(() => {
        eventEmitter.emit('TimeEvent')
    }, seconds * 1000)

    await waitForEvent(eventEmitter, 'TimeEvent')
}

export async function waitMilliseconds(ms) {
    const eventEmitter = new EventEmitter()

    setTimeout(() => {
        eventEmitter.emit('TimeEvent')
    }, ms)

    await waitForEvent(eventEmitter, 'TimeEvent')
}

export async function getWalletInfo(web3, address, tokenInfos) {

    const promises = []

    try {
        const ethPrice = await getEthPrice(web3)
        if (ethPrice) {
            const balancePromise = web3.eth.getBalance(address)
                .then(balance => walletInfo.set('', { balance: balance / (10 ** 18), symbol: afx.get_chain_symbol(), price: ethPrice }))

            promises.push(balancePromise)
        }

        let walletInfo = new Map()

        for (const tokenInfo of tokenInfos) {

            try {
                const tokenContract = new web3.eth.Contract(afx.get_ERC20_abi(), tokenInfo.address)
                const promise = tokenContract.methods.balanceOf(address).call()
                    .then(balance => walletInfo.set(tokenInfo.address, { balance: balance / (10 ** tokenInfo.decimal), symbol: tokenInfo.symbol, price: tokenInfo.price }))

                promises.push(promise)

            } catch (error) {

            }
        }

        await Promise.all(promises)

        return walletInfo

    } catch (error) {

    }
}

export const getPairedTokens = async (web3, pairAddress, version) => {

    try {
        const pairContract = new web3.eth.Contract(version === 'v2' ? afx.get_uniswapv2_pool_abi() : afx.get_uniswapv3_pool_abi(), pairAddress);

        let infoObtainer = new Concurrencer()

        const obtainer_index_token0 = infoObtainer.add(pairContract.methods.token0().call())
        const obtainer_index_token1 = infoObtainer.add(pairContract.methods.token1().call())

        await infoObtainer.wait()

        const token0 = infoObtainer.getResult(obtainer_index_token0)
        const token1 = infoObtainer.getResult(obtainer_index_token1)

        return { token0, token1 }

    } catch (error) {
        console.error(error)
    }

    return null
}

export const getFullTimeElapsedFromSeconds = (totalSecs) => {

    if (totalSecs < 0) {
        totalSecs = 0
    }

    let sec = 0, min = 0, hour = 0, day = 0

    sec = totalSecs
    if (sec > 60) {
        min = Math.floor(sec / 60)
        sec = sec % 60
    }

    if (min > 60) {
        hour = Math.floor(min / 60)
        min = min % 60
    }

    if (hour > 24) {
        day = Math.floor(hour / 24)
        hour = hour % 60
    }

    let timeElapsed = ''

    if (day > 0) {
        timeElapsed += `${day}d`
    }

    if (hour > 0) {
        if (timeElapsed !== '') {
            timeElapsed += ' '
        }

        timeElapsed += `${hour}h`
    }

    if (min > 0) {
        if (timeElapsed !== '') {
            timeElapsed += ' '
        }

        timeElapsed += `${min}m`
    }

    if (sec > 0) {
        if (timeElapsed !== '') {
            timeElapsed += ' '
        }

        timeElapsed += `${sec}s`
    }

    return timeElapsed
}

export const getFullMinSecElapsedFromSeconds = (totalSecs) => {

    let sec = 0, min = 0, hour = 0, day = 0

    sec = totalSecs
    if (sec > 60) {
        min = Math.floor(sec / 60)
        sec = sec % 60
    }

    let timeElapsed = `${min}:${sec}`

    return timeElapsed
}

export const getPair = async (web3, token0, token1) => {

    let result = null
    try {
        const factoryContract = new web3.eth.Contract(afx.get_uniswapv2_factory_abi(), afx.get_uniswapv2_factory_address());
        if (factoryContract) {
            result = await factoryContract.methods.getPair(token0, token1).call()
        }

    } catch (error) {
        console.error("find pair error", token0, token1);
    }

    return result
}

export const getPool = async (web3, token0, token1) => {

    let result = null
    try {
        const factoryContract = new web3.eth.Contract(UNISWAP_V3_FACTORY_ABI, afx.get_uniswapv3_factory_address());
        if (factoryContract) {
            result = await factoryContract.methods.getPool(token0, token1, 500).call()
        }

    } catch (error) {
        // console.error(error)
    }

    return result
}

export const getProperPair = async (web3, primaryToken, secondaryToken) => {

    let poolInfoObtainer = new Concurrencer()
    const obtainer_index_pairAddress = poolInfoObtainer.add(getPair(web3, primaryToken, secondaryToken))
    const obtainer_index_poolAddress = poolInfoObtainer.add(getPool(web3, primaryToken, secondaryToken))

    await poolInfoObtainer.wait()

    const pairAddress = poolInfoObtainer.getResult(obtainer_index_pairAddress)
    const poolAddress = poolInfoObtainer.getResult(obtainer_index_poolAddress)
    let secondaryContract = new web3.eth.Contract(afx.get_ERC20_abi(), secondaryToken);
    let v2WETH = 0, v3WETH = 0
    let decimals = await secondaryContract.methods.decimals().call();
    if (pairAddress && !pairAddress.startsWith(uniconst.NULL_ADDRESS)) {
        v2WETH = await secondaryContract.methods.balanceOf(pairAddress).call()
        v2WETH = Number(v2WETH) / 10 ** Number(decimals);
        return { address: pairAddress, volume: v2WETH, version: 'v2' }
    }
    if (poolAddress && !poolAddress.startsWith(uniconst.NULL_ADDRESS)) {
        v3WETH = await secondaryContract.methods.balanceOf(poolAddress).call()
        v3WETH = Number(v3WETH) / 10 ** Number(decimals);
        return { address: pairAddress, volume: v3WETH, version: 'v3' }
    }
    return { address: pairAddress, volume: v2WETH, version: 'v2' }

    if (v2WETH === 0 && v3WETH === 0) {
        return null
    }
    if (v2WETH >= v3WETH || afx.ONLY_V2) {
        if (v2WETH === 0) {
            return null;
        }
        return { address: pairAddress, volume: v2WETH, version: 'v2' }

    } else {

        return { address: poolAddress, volume: v3WETH, version: 'v3' }
    }
}

export const getTokenPrice = async (web3, tokenAddress) => {

    try {
        let poolInfoObtainer = new Concurrencer()

        const obtainer_index_properPair = poolInfoObtainer.add(getProperPair(web3, tokenAddress, afx.get_weth_address()))
        const obtainer_index_tokenInfo = poolInfoObtainer.add(getTokenInfoW(web3, tokenAddress))

        await poolInfoObtainer.wait()

        const pairInfo = poolInfoObtainer.getResult(obtainer_index_properPair)
        const tokenInfo = poolInfoObtainer.getResult(obtainer_index_tokenInfo)

        if (!pairInfo) {
            return null
        }

        let price
        if (pairInfo.version === 'v2') {

            const pairContract = new web3.eth.Contract(afx.get_uniswapv2_pool_abi(), pairInfo.address);

            let reserveInfoObtainer = new Concurrencer()

            const obtainer_index_reserves = reserveInfoObtainer.add(pairContract.methods.getReserves().call())
            const obtainer_index_token0 = reserveInfoObtainer.add(pairContract.methods.token0().call())
            // const obtainer_index_token1 = reserveInfoObtainer.add(pairContract.methods.token1().call())

            await reserveInfoObtainer.wait()

            const reserves = reserveInfoObtainer.getResult(obtainer_index_reserves)
            const token0 = reserveInfoObtainer.getResult(obtainer_index_token0)
            // const token1 = reserveInfoObtainer.getResult(obtainer_index_token1)

            let tokenBalance, baseTokenBalance
            if (token0.toLowerCase() === tokenAddress.toLowerCase()) {

                tokenBalance = reserves._reserve0
                baseTokenBalance = reserves._reserve1

            } else {

                tokenBalance = reserves._reserve1
                baseTokenBalance = reserves._reserve0
            }

            tokenBalance = Number(tokenBalance) / (10 ** tokenInfo.decimal)
            baseTokenBalance = Number(baseTokenBalance) / (10 ** 18)

            price = baseTokenBalance / tokenBalance

        } else {

            const poolContract = new web3.eth.Contract(afx.get_uniswapv3_pool_abi(), pairInfo.address);

            let poolInfoObtainer = new Concurrencer()

            const obtainer_index_slot0 = poolInfoObtainer.add(poolContract.methods.slot0().call())
            const obtainer_index_token0 = poolInfoObtainer.add(poolContract.methods.token0().call())

            await poolInfoObtainer.wait()

            const slot0 = poolInfoObtainer.getResult(obtainer_index_slot0)
            const token0 = poolInfoObtainer.getResult(obtainer_index_token0)

            let priceX96;
            let Q192;
            if (slot0.sqrtPriceX96 > (2 ** 96 - 1)) {
                priceX96 = (slot0.sqrtPriceX96 >> 64) ** 2;
                Q192 = 2 ** 64;
            } else {
                priceX96 = slot0.sqrtPriceX96 ** 2;
                Q192 = 2 ** 192;
            }

            let tokenBalance, baseTokenBalance
            if (token0.toLowerCase() === tokenAddress.toLowerCase()) {

                tokenBalance = Q192
                baseTokenBalance = priceX96

            } else {

                tokenBalance = priceX96
                baseTokenBalance = Q192
            }

            price = baseTokenBalance / tokenBalance
        }

        return price

    } catch (error) {
        console.error(error)
    }

    return null
}

export const getFullTxLink = (chainId, hash) => {

    let prefixHttps = ''
    if (chainId === uniconst.ETHEREUM_GOERLI_CHAIN_ID) {

        prefixHttps = 'https://goerli.etherscan.io/tx/'

    } else if (chainId === uniconst.ETHEREUM_GOERLI_CHAIN_ID) {

        prefixHttps = 'https://etherscan.io/tx/'

    } else if (chainId === uniconst.ETHEREUM_SEPOLIA_CHAIN_ID) {

        prefixHttps = 'https://sepolia.etherscan.io/tx/'
    } else if (chainId === uniconst.BSC_CHAIN_ID) {

        prefixHttps = 'https://bscscan.com/tx/'
    }

    let txLink = `${prefixHttps}${hash}`

    return txLink
}

export const getPriceImpact = async (web3, tokenAddress, sellTokenAmount) => {

    try {
        let poolInfoObtainer = new Concurrencer()

        const obtainer_index_properPair = poolInfoObtainer.add(getProperPair(web3, tokenAddress, afx.get_weth_address()))
        const obtainer_index_tokenInfo = poolInfoObtainer.add(getTokenInfoW(web3, tokenAddress))

        await poolInfoObtainer.wait()

        const pairInfo = poolInfoObtainer.getResult(obtainer_index_properPair)
        const tokenInfo = poolInfoObtainer.getResult(obtainer_index_tokenInfo)

        console.log(pairInfo)
        if (!pairInfo) {
            return 0
        }

        if (pairInfo.version === 'v2') {

            const pairContract = new web3.eth.Contract(afx.get_uniswapv2_pool_abi(), pairInfo.address);

            let reserveInfoObtainer = new Concurrencer()

            const obtainer_index_reserves = reserveInfoObtainer.add(pairContract.methods.getReserves().call())
            const obtainer_index_token0 = reserveInfoObtainer.add(pairContract.methods.token0().call())
            // const obtainer_index_token1 = reserveInfoObtainer.add(pairContract.methods.token1().call())

            await reserveInfoObtainer.wait()

            const reserves = reserveInfoObtainer.getResult(obtainer_index_reserves)
            const token0 = reserveInfoObtainer.getResult(obtainer_index_token0)
            // const token1 = reserveInfoObtainer.getResult(obtainer_index_token1)

            let tokenBalance, baseTokenBalance
            if (token0.toLowerCase() === tokenAddress.toLowerCase()) {

                tokenBalance = reserves._reserve0
                baseTokenBalance = reserves._reserve1

            } else {

                tokenBalance = reserves._reserve1
                baseTokenBalance = reserves._reserve0
            }

            tokenBalance = Number(tokenBalance) / (10 ** tokenInfo.decimal)
            baseTokenBalance = Number(baseTokenBalance) / (10 ** 18)
            // console.log('WETH', roundDecimal(baseTokenBalance, 5))

            const pricePerBaseToken = tokenBalance / baseTokenBalance

            // console.log('PEPE', roundDecimal(tokenBalance, 5))
            // console.log('pricePerBaseToken', roundDecimal(pricePerBaseToken, 15))

            const constantProduct = tokenBalance * baseTokenBalance
            // console.log('constantProduct', roundDecimal(constantProduct, 20))
            const baseTokenNewAmount = constantProduct / (tokenBalance + sellTokenAmount)
            // console.log('baseTokenAmount', roundDecimal(baseTokenBalance, 20))
            // console.log('baseTokenNewAmount', roundDecimal(baseTokenNewAmount, 20))

            const baseTokenReceived = baseTokenBalance - baseTokenNewAmount

            // console.log('baseTokenReceived', roundDecimal(baseTokenReceived, 20))

            const pricePaidPerBaseToken = sellTokenAmount / baseTokenReceived

            // console.log('pricePaidPerBaseToken', roundDecimal(pricePaidPerBaseToken, 20))

            const priceImpact = (pricePerBaseToken - pricePaidPerBaseToken) / pricePerBaseToken
            // console.log('priceImpact', roundDecimal(priceImpact, 20))

            return priceImpact
        }

        return 0

    } catch (error) {

        console.log('getPriceImpact', error, afx.parseError(error))
    }

    return 0
}

export const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export const getBlockTimeStampFromBlockNumber = async (web3, blockNumber) => {

    let timeData = await web3.eth.getBlock(blockNumber);
    if (!timeData) {
        const date = new Date();
        timeData = Math.floor(date.getTime() / 1000);
    }
    return timeData.timestamp;
}

export const getBlockNumberByTimestamp = async (timestamp) => {
    let url = `${afx.get_apibaseurl()}/api?module=block&action=getblocknobytime&timestamp=${timestamp}&closest=before`
    const apiKey = await ethscan_api.getApiKey()
    const resp = await ethscan_api.executeEthscanAPI(url, apiKey)

    if (!resp || !resp.result || resp.status == 0) {
        return null
    }
    return resp.result
}

export const getDateTimeFromTimestamp = (timestmp) => {

    const value = new Date(timestmp)
    let month = (value.getMonth() + 1).toString()
    let day = value.getDate().toString()
    let year = value.getFullYear().toString()

    return `${month}/${day}/${year}`
}

export const toBNe18 = (web3, value) => {

    return web3.utils.toBN(web3.utils.toWei(value.toFixed(18).toString(), 'ether'))
}

export const toBNeN = (web3, value, decimals = 18) => {

    if (18 < decimals || decimals < 1) {
        throw `Decimal must be between 1 to 18`
    }

    return web3.utils.toBN(web3.utils.toWei(value.toFixed(18).toString())).div(web3.utils.toBN(10 ** (18 - decimals)))
}

export const getGasTracker = async (web3) => {

    const block = await web3?.eth.getBlock('latest')
    const blockNumber = block?.number
    const ethPrice = await getEthPrice(web3) ?? 0
    const gasPrice = await web3.eth.getGasPrice() / 10 ** 9

    return { blockNumber, ethPrice, gasPrice }
}


export const getConfigString_Default = (value, defaultValue, unit = '', prefix = '', digit = 9) => {

    let output

    const value2 = (typeof value === 'number' ? roundDecimal(value, digit) : value)

    let temp
    if (unit === 'USD') {
        temp = `$${value2}`
    } else if (unit === '%') {
        temp = `${value2}%`
    } else {
        temp = `${value2}${unit.length > 0 ? ' ' + unit : ''}`
    }

    if (value === defaultValue) {
        output = `Default (${prefix}${temp})`
    } else {
        output = `${prefix}${temp}`
    }

    return output
}

export const getConfigString_Text = (text, value, autoValue, unit = '', digit = 9) => {

    let output

    if (value === autoValue) {
        output = text
    } else {

        const value2 = (typeof value === 'number' ? roundDecimal(value, digit) : value)
        if (unit === 'USD') {
            output = `$${value2}`
        } else if (unit === '%') {
            output = `${value2}%`
        } else {
            output = `${value2}${unit.length > 0 ? ' ' + unit : ''}`
        }
    }

    return output
}

export const getConfigString_Checked = (value) => {

    let output

    if (value === 2) {
        output = '🌐'
    } else if (value === 1) {
        output = '✅'
    } else {
        output = '❌'
    }

    return output
}

export const getConfigWallet_Checked = (value) => {

    let output

    if (value === 1) {
        output = '✅'
    } else {
        output = ''
    }

    return output
}

export function objectDeepCopy(obj, keysToExclude) {
    if (typeof obj !== 'object' || obj === null) {
        return obj; // Return non-objects as is
    }

    const copiedObject = {};
    for (const key in obj) {
        if (obj.hasOwnProperty(key) && !keysToExclude.includes(key)) {
            copiedObject[key] = obj[key];
        }
    }

    return copiedObject;
}

export async function getGasPrices(web3) {
    try {
        const gasPrice = await web3.eth.getGasPrice();
        console.log("==============gasPrice================", gasPrice)
        const gasPrices = {
            low: web3.utils
                .toBN(gasPrice),
            medium: web3.utils
                .toBN(gasPrice)
                .muln(1.2),
            high: web3.utils
                .toBN(gasPrice)
                .muln(1.5),
        };
        // console.log("chainID", chainID, gasPrices)
        return gasPrices;
    } catch (error) {
        console.log("error:", error);
    }
};

export const nullWalk = (val) => {
    if (!val) {
        return afx.NOT_ASSIGNED
    }

    return val
}

export const generateReferralCode = (chatid) => {

    const result = encodeURIComponent(btoa(chatid))
    return result
}
  
export const decodeReferralCode = (code) => {

    try {
        return atob(decodeURIComponent(code))
    } catch (err) {
        return ''
    }  
}