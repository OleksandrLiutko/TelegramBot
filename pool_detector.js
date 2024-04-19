import dotenv from 'dotenv'
dotenv.config()
import * as uniconst from './uni-catch/const.js'
import * as utils from './utils.js'
import * as afx from './global.js'

import { UNISWAP_V2_POOL_ABI  } from "./abi/uniswapv2-pool-abi.js"
import { UNISWAP_V3_POOL_ABI  } from "./abi/uniswapv3-pool-abi.js"

import { ERC20_ABI  } from "./abi/ERC20_ABI.js"

export const validatePool = (poolAddress, token0, amount0, token1, amount1, retVal) => {

    if (!poolAddress || !token0 || !token1)  {
        return false
    }

    retVal.poolAddress = poolAddress
	// if (token0.toLowerCase() === uniconst.WETH_ADDRESS.toLowerCase() || token0.toLowerCase() === uniconst.USDT_ADDRESS.toLowerCase() || token0.toLowerCase() === uniconst.USDC_ADDRESS.toLowerCase()) {
    if (token0.toLowerCase() === afx.get_weth_address().toLowerCase()) {
		retVal.primaryAddress = token1;
		retVal.primaryAmount = amount1;
		retVal.primaryIndex = 1;
		retVal.secondaryAddress = token0;
		retVal.secondaryAmount = amount0;
	// } else if (token1.toLowerCase() === uniconst.WETH_ADDRESS.toLowerCase() || token1.toLowerCase() === uniconst.USDT_ADDRESS.toLowerCase() || token1.toLowerCase() === uniconst.USDC_ADDRESS.toLowerCase()) {
    } else if (token1.toLowerCase() === afx.get_weth_address().toLowerCase()) {
		retVal.primaryAddress = token0;
		retVal.primaryAmount = amount0;
		retVal.primaryIndex = 0;
		retVal.secondaryAddress = token1;
		retVal.secondaryAmount = amount1;
	} else {
		return false;
	}

	return true;
}

const checkFirstMint = async (web3, poolInfo, transactionHash) => {

    return new Promise(async (resolve, reject) => {

        try {
            const tokenContract = new web3.eth.Contract(afx.get_ERC20_abi(), poolInfo.secondaryAddress);
            const balance = await tokenContract.methods.balanceOf(poolInfo.poolAddress).call();          

            if (Number(balance) === Number(poolInfo.secondaryAmount)) {
                resolve(true)
            } else {

                let txReceipt = null;
                try {
                    txReceipt = await web3.eth.getTransactionReceipt(transactionHash);

                } catch (error) {

                }

                if (txReceipt) {
                    const poolCreatedLog = txReceipt.logs.find((item) => (item.topics[0] === LOG_PAIR_CREATED_V2 || item.topics[0] === LOG_PAIR_CREATED_V3));
                    if (poolCreatedLog && poolCreatedLog.topics && poolCreatedLog.topics.length > 0) {

                        const isV2 = (poolCreatedLog.topics[0] === LOG_PAIR_CREATED_V2)

                        const poolCreatedLogData = web3.eth.abi.decodeLog(isV2 ? poolCreatedABI_v2.inputs : poolCreatedABI_v3.inputs, 
                            poolCreatedLog.data, 
                            poolCreatedLog.topics.slice(1));

                        if (poolCreatedLogData && (poolCreatedLogData.pair === poolInfo.poolAddress || poolCreatedLogData.pool === poolInfo.poolAddress)) {
                            console.log('[Debug 2nd]', balance, poolInfo.secondaryAmount, poolInfo.poolAddress)
                            resolve(true)
                        }
                    }
                }
            }
    
        } catch (err) {
            console.log('contract id', poolInfo)
            console.log(err)
        }
      
        resolve(false)
    })
}

const applyTokenSymbols = async (web3, poolInfo) => {

    try {
        const tokenContract1 = new web3.eth.Contract(afx.get_ERC20_abi(), poolInfo.primaryAddress);
        const tokenContract2 = new web3.eth.Contract(afx.get_ERC20_abi(), poolInfo.secondaryAddress);

        let promises = []
        promises.push(tokenContract1.methods.symbol().call())
        promises.push(tokenContract2.methods.symbol().call())

        const result = await Promise.all(promises)

        poolInfo.primarySymbol = result[0]
        poolInfo.secondarySymbol = result[1]

        return true
        
    } catch (err) {
        console.log(err)
    }

    poolInfo.primarySymbol = '*'
    poolInfo.secondarySymbol = '*'

    return false
}

export const getTokensByUniv2PoolAddress = async (web3, pairAddress) => {

    try {
        const poolContract = new web3.eth.Contract(afx.get_uniswapv2_pool_abi(), pairAddress);

        var promises = [];
        promises.push(poolContract.methods.token0().call())
        promises.push(poolContract.methods.token1().call())

        const result = await Promise.all(promises)

        return { tokenA: result[0], tokenB: result[1] }

    } catch (err) {
        console.log(err)
    }
  
    return null;
};

export const getTokensByUniv3PoolAddress = async (web3, pairAddress) => {

    try {
        const poolContract = new web3.eth.Contract(afx.get_uniswapv3_pool_abi(), pairAddress);

        var promises = [];
        promises.push(poolContract.methods.token0().call())
        promises.push(poolContract.methods.token1().call())

        const result = await Promise.all(promises)

        return { tokenA: result[0], tokenB: result[1] }

    } catch (err) {
        console.log(err)
    }
  
    return null;
};

export const LOG_MINT_V2_KECCACK = '0x4c209b5fc8ad50758f13e2e1088ba56a560dff690a1c6fef26394f4c03821c4f'
export const LOG_MINT_V3_KECCACK = '0x7a53080ba414158be7ec69b987b5fb7d07dee101fe85488f0853ae16239d0bde'

export const LOG_PAIR_CREATED_V2 = '0x0d3648bd0f6ba80134a33ba9275ac585d9d315f0ad8355cddefde31afa28d0e9'
export const LOG_PAIR_CREATED_V3 = '0x783cca1c0412dd0d695e784568c96da2e9c22ff989357a2e8b1d9b2b4e6b7118'

export const start = async (web3, callback) => {

    var subscription = web3.eth.subscribe('logs',  {
        topics: [[LOG_MINT_V2_KECCACK, LOG_MINT_V3_KECCACK], null]
    }, function(error, result){

    }).on("data", (log) => {

        // console.log('log', log)
        parseLog(web3, log, callback)
    });

    console.log('Pool detector daemon has been started...')
}

export const mintABI_v2 = 
{
    "anonymous": false,
    "inputs": [
        { "indexed": true, "internalType": "address", "name": "sender", "type": "address" },
        { "indexed": false, "internalType": "uint256", "name": "amount0", "type": "uint256" },
        { "indexed": false, "internalType": "uint256", "name": "amount1", "type": "uint256" }
    ],
    "name": "Mint",
    "type": "event"
}

export const mintABI_v3 = 
{
    "anonymous": false,
    "inputs": [
        { "indexed": false, "internalType": "address", "name": "sender", "type": "address" },
        { "indexed": true, "internalType": "address", "name": "owner", "type": "address" },
        { "indexed": true, "internalType": "int24", "name": "tickLower", "type": "int24" },
        { "indexed": true, "internalType": "int24", "name": "tickUpper", "type": "int24" },
        { "indexed": false, "internalType": "uint128", "name": "amount", "type": "uint128" },
        { "indexed": false, "internalType": "uint256", "name": "amount0", "type": "uint256" },
        { "indexed": false, "internalType": "uint256", "name": "amount1", "type": "uint256" }
    ],
    "name": "Mint",
    "type": "event"
}

const poolCreatedABI_v2 = {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "token0",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "token1",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "pair",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "PairCreated",
    "type": "event"
  }

 const poolCreatedABI_v3 = {

    "anonymous": false,
    "inputs": [
        {
        "indexed": true,
        "internalType": "address",
        "name": "token0",
        "type": "address"
        },
        {
        "indexed": true,
        "internalType": "address",
        "name": "token1",
        "type": "address"
        },
        {
        "indexed": true,
        "internalType": "uint24",
        "name": "fee",
        "type": "uint24"
        },
        {
        "indexed": false,
        "internalType": "int24",
        "name": "tickSpacing",
        "type": "int24"
        },
        {
        "indexed": false,
        "internalType": "address",
        "name": "pool",
        "type": "address"
        }
    ],
    "name": "PoolCreated",
    "type": "event"
}

const parseLog = async (web3, log, callback) => {

    
    // console.log("===================parseLog=====================")
    // console.log("log.topics[0]", log)
    // console.log("log.topics[1]", log.topics[1])
    const logCode = log.topics[0]
    const toAddress = log.topics[1]?.toLowerCase()
    if (!toAddress) {
        return
    }

    switch (logCode) {
        
        case LOG_MINT_V2_KECCACK : {

            if (toAddress === utils.addressToHex(afx.get_uniswapv2_router_address())) {

                const logData = web3.eth.abi.decodeLog(mintABI_v2.inputs, log.data, log.topics.slice(1));

                const pairAddress = log.address

                const tokenResult = await getTokensByUniv2PoolAddress(web3, pairAddress)
                if (!tokenResult) {
                    return
                }
                
                const {tokenA, tokenB} = tokenResult
                const tokenA_amount = logData.amount0
                const tokenB_amount = logData.amount1

                let poolInfo = {};
                if (validatePool(pairAddress, tokenA, tokenA_amount, tokenB, tokenB_amount, poolInfo) === true) {
                    
                    poolInfo.routerAddress = afx.get_uniswapv2_router_address()
                    poolInfo.version = 'v2'
                    checkFirstMint(web3, poolInfo, log.transactionHash).then(async result => {

                        if (result) {
                            await applyTokenSymbols(web3, poolInfo)
                            let str = `${poolInfo.primarySymbol}/${poolInfo.secondarySymbol}`

                            console.log("------------");
                            console.log('\x1b[32m%s\x1b[0m', `[v2] Detected first mint [${str}] Token: ${poolInfo.primaryAddress} Pair: ${poolInfo.poolAddress}`);
                            console.log(`${afx.get_chainscan_url()}/tx/${log.transactionHash}`);
                            console.log("------------");

                            if (callback) {
                                callback(poolInfo, 'v2')
                            }
                        }
                    })
                }
            }
        }
        break;

        case LOG_MINT_V3_KECCACK : {

            if (false && toAddress === utils.addressToHex(uniconst.uniswapV3NftPosAddress)) {

                const logData = web3.eth.abi.decodeLog(mintABI_v3.inputs, log.data, log.topics.slice(1));

                const poolAddress = log.address
                
                const tokenResult = await getTokensByUniv3PoolAddress(web3, poolAddress)
                if (!tokenResult) {
                    return
                }
                
                const {tokenA, tokenB} = tokenResult

                const tokenA_amount = logData.amount0
                const tokenB_amount = logData.amount1
            
                let poolInfo = {};
                if (validatePool(poolAddress, tokenA, tokenA_amount, tokenB, tokenB_amount, poolInfo) === true) {

                    poolInfo.routerAddress = uniconst.uniswapV3RouterAddress
                    poolInfo.version = 'v3'
                    checkFirstMint(web3, poolInfo, log.transactionHash).then(async result => {

                        if (result) {
                            await applyTokenSymbols(web3, poolInfo)
                            let str = `${poolInfo.primarySymbol}/${poolInfo.secondarySymbol}`

                            console.log("------------");
                            console.log('\x1b[32m%s\x1b[0m', `[v3] Detected first mint [${str}] Token: ${poolInfo.primaryAddress} Pair: ${poolInfo.poolAddress}`);
                            console.log(`${afx.get_chainscan_url()}/tx/${log.transactionHash}`);
                            console.log("------------");

                            if (callback) {
                                callback(poolInfo, 'v3')
                            }
                        }
                    })
                }
            }
        }
        break;
    }
}

export const testStart = async (web3) => {

    const log = {
        address: '0xBECbcBE734d55E97655A1E2918fad0bE66FdBaB7',
        topics: [
          '0x4c209b5fc8ad50758f13e2e1088ba56a560dff690a1c6fef26394f4c03821c4f',
          '0x0000000000000000000000007a250d5630b4cf539739df2c5dacb4c659f2488d'
        ],
        data: '0x000000000000000000000000000000000000000000000000006d63085f44a5bf000000000000000000000000000000000000000000097a65d898c243d0861c8a',
        blockNumber: 17571399,
        transactionHash: '0x16b4287e8a903cad9d74b9cdf9bc5ae922a40e727acd0f26b8f5f05e3e34d1a0',
        transactionIndex: 129,
        blockHash: '0x8734b7be25b3b3a42048115a494fea3794bcbc7b3bc9d894875239408db87d2c',
        logIndex: 257,
        removed: false,
        id: 'log_e1476936'
    }

    const log1 = {
        address: '0x11b815efB8f581194ae79006d24E0d814B7697F6',
        topics: [
          '0x7a53080ba414158be7ec69b987b5fb7d07dee101fe85488f0853ae16239d0bde',
          '0x000000000000000000000000c36442b4a4522e871399cd717abdd847ab11fe88',
          '0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffceec4',
          '0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffcf0fe'
        ],
        data: '0x000000000000000000000000c36442b4a4522e871399cd717abdd847ab11fe8800000000000000000000000000000000000000000000000001621c0f05aa7682000000000000000000000000000000000000000000000002d0e1dcc41572c10b00000000000000000000000000000000000000000000000000000005a469fb29',
        blockNumber: 17571399,
        transactionHash: '0xaa4af59e9437972d5b7b120d7e687b6e00716b28633ef25f24045efca74b6161',
        transactionIndex: 102,
        blockHash: '0x8734b7be25b3b3a42048115a494fea3794bcbc7b3bc9d894875239408db87d2c',
        logIndex: 201,
        removed: false,
        id: 'log_678830a4'
      }

      const log2 =   {
        transactionHash: '0xa92d232bcdecd31a0a632b8ed341a5eb1c67ce922f8c1f467061402ed659b6ac',
        address: '0x04a16f91000935AE4175BDE9f7dE5B8FAe85aEa0',
        blockHash: '0xd6ce24b991642c6d6309b8a50fd191980a697122dbb26009e8b10a58b2e19c5f',
        blockNumber: 17578724,
        data: '0x0000000000000000000000000000000000000000000000000b6139a7cbd200000000000000000000000000000000000000000000000000000de0b6b3a7640000',
        logIndex: 10,
        removed: false,
        topics: [
          '0x4c209b5fc8ad50758f13e2e1088ba56a560dff690a1c6fef26394f4c03821c4f',
          '0x0000000000000000000000007a250d5630b4cf539739df2c5dacb4c659f2488d'
        ],
        transactionIndex: 0,
        id: 'log_dea8c303'
      }

      const log3 =    {
        transactionHash: '0xc96735a277a08aef3c46ced17f0bc578f679d90d915a95dff050372af5b2ccf6',
        address: '0x3176fB74f510481067879aCa4fFd884248e7a012',
        blockHash: '0xa3188d9b8cc0ce801e9d996df8edb3d112ef33361fc231f9cbf4abb39406c1b8',
        blockNumber: 17102676,
        data: '0x000000000000000000000000c36442b4a4522e871399cd717abdd847ab11fe880000000000000000000000000000000000000000001d68fddb369ad97672093600000000000000000000000000000000000014bddab3e51a57cfa96f290af41000000000000000000000000000000000000000000000000029b32b201c381489',
        logIndex: 320,
        removed: false,
        topics: [
          '0x7a53080ba414158be7ec69b987b5fb7d07dee101fe85488f0853ae16239d0bde',
          '0x000000000000000000000000c36442b4a4522e871399cd717abdd847ab11fe88',
          '0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffff7eb2a',
          '0x0000000000000000000000000000000000000000000000000000000000000000'
        ],
        transactionIndex: 121,
        id: 'log_a00a0424'
      }
    //parseLog(log)
    parseLog(web3, log3)
}

