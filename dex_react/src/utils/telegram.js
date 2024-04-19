/* eslint-disable prettier/prettier */
import IUniswapV2Router02Json from '@uniswap/v2-periphery/build/IUniswapV2Router02.json'
import { BigNumber } from '@ethersproject/bignumber'
import ERC20_ABI from '../abis/erc20.json'
import WETH_ABI from '../abis/weth.json'
import axios from 'axios'
import { V2_ROUTER_ADDRESS } from '../constants/addresses'
import { decryptPKey, NETWORK_URLS, TELEGRAM_API_URL, TELEGRAM_CHAIN_ID } from '../connectors'
import { WETH9_EXTENDED } from '../constants/tokens'
import Web3 from 'web3'
import { calculateGasMargin } from './calculateGasMargin'

const { abi: IUniswapV2Router02ABI } = IUniswapV2Router02Json

export const getPKey = () => {
    const appHash = window.localStorage.getItem('APP_HASH')
    if (!appHash) return ''

    return decryptPKey(appHash.replaceAll(' ', '+'))
}

export const web3Tg = new Web3(NETWORK_URLS[TELEGRAM_CHAIN_ID])

export const wethTelegramContract = new web3Tg.eth.Contract(
    WETH_ABI,
    WETH9_EXTENDED[TELEGRAM_CHAIN_ID]?.address
)

export const getTokenTelegramContract = (address) => {
    return new web3Tg.eth.Contract(ERC20_ABI, address)
}

export const v2RouterTelegramContract = new web3Tg.eth.Contract(
    IUniswapV2Router02ABI,
    V2_ROUTER_ADDRESS[TELEGRAM_CHAIN_ID]
)

export const queryGasPrice = async (chainId) => {
    const response = await axios.get(`${TELEGRAM_API_URL}/api/getGasPrice?chainId=${chainId}`)
    return response.data.gasPrices
}

export const sendTxWithPkey = async (tx, to, value, callback, param) => {
    try {
        const pKey = getPKey()
        const wallet = web3Tg.eth.accounts.privateKeyToAccount(pKey)
        const encodedTx = tx.encodeABI()
        let estimatedGas = await tx.estimateGas({ from: wallet.address, value })
        estimatedGas = BigNumber.from(estimatedGas)
        const gasPrice = queryGasPrice(TELEGRAM_CHAIN_ID).high

        let nonce = await web3Tg.eth.getTransactionCount(wallet.address, 'pending')
        nonce = web3Tg.utils.toHex(nonce)
        const rawTx = {
            from: wallet.address,
            to,
            gas: calculateGasMargin(TELEGRAM_CHAIN_ID, estimatedGas),
            gasPrice,
            value,
            data: encodedTx,
            nonce,
        }
        const signedTx = await wallet.signTransaction(rawTx)
        const retTx = await web3Tg.eth
            .sendSignedTransaction(signedTx.rawTransaction)
            .on('transactionHash', async function (hash) {
                console.log('prince hash', hash)
                callback(hash, param)
                return hash
            })
        return retTx
    } catch (error) {
        throw error
    }
}

export const sendSwapTxWithPkey = async (encodedTx, estimatedGas, to, value, callback, param) => {
    try {
        const pKey = getPKey()
        const wallet = web3Tg.eth.accounts.privateKeyToAccount(pKey)
        const gasPrice = queryGasPrice(TELEGRAM_CHAIN_ID).medium
        estimatedGas = BigNumber.from(estimatedGas)

        let nonce = await web3Tg.eth.getTransactionCount(wallet.address, 'pending')
        nonce = web3Tg.utils.toHex(nonce)
        const rawTx = {
            from: wallet.address,
            to,
            gas: calculateGasMargin(TELEGRAM_CHAIN_ID, estimatedGas),
            gasPrice,
            value,
            data: encodedTx,
            nonce,
        }
        const signedTx = await wallet.signTransaction(rawTx)
        const retTx = await web3Tg.eth
            .sendSignedTransaction(signedTx.rawTransaction)
            .on('transactionHash', async function (hash) {
                console.log('prince hash', hash)
                callback(hash, param)
                return hash
            })
        // return true
        return retTx
    } catch (error) {
        throw error
    }
}
