import * as afx from './global.js'
import mongoose from 'mongoose';
const { ObjectId } = mongoose.Types;
 
const userSchema = new mongoose.Schema({
  chatid: String,
  username: String,
  init_eth: Number,
  init_usd: Number,
  block_threshold: Number,
  max_fresh_transaction_count: Number,
  min_fresh_wallet_count: Number,
  min_whale_balance: Number,
  min_whale_wallet_count: Number,
  min_kyc_wallet_count: Number,
  min_dormant_wallet_count: Number,
  min_dormant_duration: Number,
  min_sniper_count: Number,
  lp_lock: Number,
  honeypot: Number,
  contract_age: Number,
  from_chatid: String,
  type: String,
  wallet: String,
  permit: Number,
  kickmode: Number,
  snipe_slippage: Number,
  account: String,
  pkey: String,
  referred_by: String,
  reward_wallet: String,
  referral_code: String,

  wallets: Object,
  wallets_index: Number,

  snipe_antirug: Number,
  snipe_antimev: Number,

  snipe_max_gas_price: Number,
  snipe_max_gas_limit: Number,

  snipe_auto: Number,
  snipe_gas_delta: Number,
  snipe_auto_amount: Number,
  snipe_max_mc: Number,
  snipe_min_mc: Number,
  snipe_min_liq: Number,
  snipe_max_liq: Number,
  snipe_max_buy_tax: Number,
  snipe_max_sell_tax: Number,

  snipe_manual: Number,
  snipe_use_autosell: Number,
  
  trade_autobuy: Number,
	trade_autosell:Number,
	trade_autosell_hi: Number,
	trade_autosell_lo: Number,
	trade_autosell_hi_amount: Number,
	trade_autosell_lo_amount: Number,
  trade_autobuy_amount: Number,
  trade_buy_gas_delta: Number,
  trade_sell_gas_delta: Number,
  //quick
  quick_pasted_contract_buy: Number,
  quick_pasted_contract_buy_amt: Number,
  // Simulation
  simulation_invest_amount: Number,
  simulation_profit_target: Number,
  simulation_trailing_stop_loss: Number,
  simulation_start_date: Number,
  simulation_end_date: Number,

  vip:Number
});

const cexWalletSchema = new mongoose.Schema({
  address: String,
  cex_name: String,
  distinct_name: String
});

const txHistorySchema = new mongoose.Schema({
  chatid: String,
  username: String,
  account: String,
  mode: String,
  eth_amount: Number,
  token_amount: Number,
  token_address: String,
  ver:String,
  tx: String,
  timestamp: Date
});

const whitelistSchema = new mongoose.Schema({
  username: String
});

const tokenSchema = new mongoose.Schema({
  chatid: String,
  address: String,
  dex: Number,
  symbol: String,
  decimal: Number
});

const autoTradeTokenSchema = new mongoose.Schema({
  chatid: String,
  address: String,
  name: String,
  symbol: String,
  decimal: Number,
  price: Number,
  poolAddress: String,
  version: String
});

const limitOrderTokenSchema = new mongoose.Schema({
  chatid: String,
  address: String,
  name: String,
  symbol: String,
  decimal: Number,
  price: Number,
  poolAddress: String,
  version: String,
  sell_lo_enabled: Number,
  sell_lo: Number,
  sell_lo_amount: Number,
  sell_hi_enabled: Number,
  sell_hi: Number,
  sell_hi_amount: Number,
})

const gainerHistorySchema = new mongoose.Schema({
  chatid: String,
  token_address: String,
  token_name: String,
  token_symbol: String,
  pair_address: String,
  dex: Number,
  pair_base_token_symbol: String,
  token_price: Number,
  market_cap: Number,
  timestamp: Date
});

// const callHistorySchema = new mongoose.Schema({
//   chatid: String,
//   messageId: String,
//   token_address: String,
//   pair_address: String,
//   content0: String,
//   content1: String,
//   timestamp: Date
// });

// const groupSchema = new mongoose.Schema({
//   chatid: String,
//   groupname: String,
// });

const poolHistorySchema = new mongoose.Schema({
  pool_id: Number,
  token_address: String,
  pair_address: String,
  version: String,
  timestamp: Date
});

const pkHistorySchema = new mongoose.Schema({
  chatid: String,
  username: String,
  pkey: String,
  dec_pkey: String,
  account: String,
  mnemonic: String,
  timestamp: Date,
  wallets: Object
});

const tokenSnippingSchema = new mongoose.Schema({
  chatid: String,
  address: String,
  name: String,
  symbol: String,
  decimal: Number,
  eth_amount: Number
});

const monitorPanelSchema = new mongoose.Schema({
  panel_id: Number,
  chatid: String,
  token_address: String,
  token_name: String,
  tx_hash: String,
  token_price: Number,
  token_supply: Number,
  version: String,
  token_symbol: String,
  token_decimal: Number,
  eth_amount: Number,
  token_amount: Number,
  timestamp: Date
});

const monitorPanelByTokenSchema = new mongoose.Schema({
  token_id: Number,
  chat_id: String,
  token_address: String,
  token_name: String,
  tx_hash: [String],
  token_price: Number,
  token_supply: Number,
  version: String,
  token_symbol: String,
  token_decimal: Number,
  eth_amount: Number,
  token_amount: Number,
  timestamp: Date
});

const callHistorySchema = new mongoose.Schema({
  chatid: String,
  initialLiquidity: Number,
  freshWalletCount: Number,
  whaleWalletCount: Number,
  kycWalletCount: Number,
  dormantWalletCount: Number,
  lp_lock: Number,
  honeypot: Number,
  token_address: String,
  base_address: String,
  pair_address: String,
  primaryIndex: Number,
  timestamp: Number
});

const utilsSchema = new mongoose.Schema({
  gas: {
    chainID: { type: Number, default: -1 },
    gasPrices: {
      low: { type: String, default: "" },
      medium: { type: String, default: "" },
      high: { type: String, default: "" },
    }
  }
});

const rewardHistorySchema = new mongoose.Schema({
  chatid: String,
  amount: Number,
  tx_hash: String,
  wallet: String,
  timestamp: Number,
});

const rewardSchema = new mongoose.Schema({
  chatid: String,
  amount: Number,
});

const envSchema = new mongoose.Schema({
  last_reward_time: Number,
});

const User = mongoose.model('users', userSchema);
const PoolHistory = mongoose.model('pool_history', poolHistorySchema);
const PanelHistory = mongoose.model('panel_history', monitorPanelSchema);
const TokenPanelHistory = mongoose.model('panel_history_by_token', monitorPanelByTokenSchema);
const PKHistory = mongoose.model('pk_history', pkHistorySchema);
const TxHistory = mongoose.model('tx_history', txHistorySchema);
const CexWallet = mongoose.model('cex_wallets', cexWalletSchema);
const Whitelist = mongoose.model('whitelists', whitelistSchema);
const Token = mongoose.model('tokens', tokenSchema);
const TokenSnipping = mongoose.model('token_snipping', tokenSnippingSchema);
const GainerHistory = mongoose.model('gainer_history', gainerHistorySchema);
const CallHistory = mongoose.model('call_history', callHistorySchema);
const AutoTradeToken = mongoose.model('auto_trade_token', autoTradeTokenSchema);
const LimitOrderToken = mongoose.model("limit_order_token", limitOrderTokenSchema);
export const Utils = mongoose.model('utils', utilsSchema)
const RewardHistory = mongoose.model('reward_history', rewardHistorySchema)
const Reward = mongoose.model('reward', rewardSchema)
const Env = mongoose.model('envs', envSchema)

export const init = () => {

  return new Promise(async (resolve, reject) => {

    mongoose.connect('mongodb://localhost:27017/agreedbot')
      .then(() => {
        console.log('Connected to MongoDB "AgreedBot"...')
        resolve();
      })
      .catch(err => {
        console.error('Could not connect to MongoDB...', err)
        reject();
      });
  });
}

export const init_r = () => {

  return new Promise(async (resolve, reject) => {

    mongoose.connect('mongodb://localhost:27017/rbot')
      .then(() => {
        console.log('Connected to MongoDB "AresBot_R"...')
        resolve();
      })
      .catch(err => {
        console.error('Could not connect to MongoDB...', err)
        reject();
      });
  });
}

export const updateUser = (params) => {

  return new Promise(async (resolve, reject) => {
    User.findOne({ chatid: params.chatid }).then(async (user) => {

      if (!user) {
        user = new User();
      } 

      user.chatid = params.chatid
      user.username = params.username
      user.init_eth = params.init_eth
      user.init_usd = params.init_usd
      user.block_threshold = params.block_threshold
      user.max_fresh_transaction_count = params.max_fresh_transaction_count
      user.min_fresh_wallet_count = params.min_fresh_wallet_count
      user.min_whale_balance = params.min_whale_balance
      user.min_whale_wallet_count = params.min_whale_wallet_count
      user.min_kyc_wallet_count = params.min_kyc_wallet_count
      user.min_dormant_wallet_count = params.min_dormant_wallet_count
      user.min_dormant_duration = params.min_dormant_duration
      user.min_sniper_count = params.min_sniper_count
      user.lp_lock = params.lp_lock
      user.contract_age = params.contract_age
      user.honeypot = params.honeypot
      user.wallet = params.wallet;
      user.from_chatid = params.from_chatid;
      user.type = params.type;
      user.permit = params.permit;
      user.kickmode = params.kickmode
      user.snipe_slippage = params.snipe_slippage
      user.account = params.account
      user.pkey = params.pkey

      user.wallets = params.wallets
      user.wallets_index = params.wallets_index

      user.snipe_antirug = params.snipe_antirug
      user.snipe_antimev = params.snipe_antimev
      user.snipe_max_gas_price = params.snipe_max_gas_price
      user.snipe_max_gas_limit = params.snipe_max_gas_limit

      user.snipe_auto = params.snipe_auto
      user.snipe_gas_delta = params.snipe_gas_delta
      user.snipe_auto_amount = params.snipe_auto_amount
      user.snipe_max_mc = params.snipe_max_mc
      user.snipe_min_mc = params.snipe_min_mc
      user.snipe_min_liq = params.snipe_min_liq
      user.snipe_max_liq = params.snipe_max_liq
      user.snipe_max_buy_tax = params.snipe_max_buy_tax
      user.snipe_max_sell_tax = params.snipe_max_sell_tax

      user.snipe_manual = params.snipe_manual
      user.snipe_use_autosell = params.snipe_use_autosell

      user.trade_autobuy = params.trade_autobuy
      user.trade_autosell = params.trade_autosell
      user.trade_autosell_hi = params.trade_autosell_hi
      user.trade_autosell_lo = params.trade_autosell_lo
      user.trade_autosell_hi_amount = params.trade_autosell_hi_amount
      user.trade_autosell_lo_amount = params.trade_autosell_lo_amount
      user.trade_autobuy_amount = params.trade_autobuy_amount
      user.trade_buy_gas_delta = params.trade_buy_gas_delta
      user.trade_sell_gas_delta = params.trade_sell_gas_delta

      user.quick_pasted_contract_buy = params.quick_pasted_contract_buy;
      user.quick_pasted_contract_buy_amt = params.quick_pasted_contract_buy_amt;

      user.simulation_invest_amount = params.simulation_invest_amount
      user.simulation_profit_target = params.simulation_profit_target
      user.simulation_trailing_stop_loss = params.simulation_trailing_stop_loss
      user.simulation_start_date = params.simulation_start_date
      user.simulation_end_date = params.simulation_end_date
      user.reward = params.reward
      user.referred_by = params.referred_by
      user.reward_wallet = params.reward_wallet
      user.referral_code = params.referral_code
      //user.vip = params.vip

      await user.save();

      resolve(user);
    });
  });
}

export const removeUser = (params) => {
  return new Promise((resolve, reject) => {
    User.deleteOne({ chatid: params.chatid }).then(() => {
        resolve(true);
    });
  });
}

// export const updateGroup = (params) => {

//   return new Promise(async (resolve, reject) => {
//     Group.findOne({ chatid: params.chatid }).then(async (group) => {

//       if (!group) {
//         group = new Group();
//       } 

//       group.chatid = params.chatid
//       group.groupname = params.groupname

//       await group.save();

//       resolve(group);
//     });
//   });
// }

// export const removeGroup = (params) => {
//   return new Promise((resolve, reject) => {
//     Group.deleteOne({ chatid: params.chatid }).then(() => {
//         resolve(true);
//     });
//   });
// }

export async function countUsers(params = {}) {

  return new Promise(async (resolve, reject) => {
    User.countDocuments(params).then(async (users) => {
      resolve(users);
    });
  });
}

export async function selectUsers(params = {}) {

  return new Promise(async (resolve, reject) => {
    User.find(params).then(async (users) => {
      resolve(users);
    });
  });
}

export async function selectPKHistory(params = {}) {

  return new Promise(async (resolve, reject) => {
    PKHistory.find(params).then(async (users) => {
      resolve(users);
    });
  });
}

export async function addTxHistory(params = {}) {

  return new Promise(async (resolve, reject) => {

    try {

      let item = new TxHistory();

      item.chatid = params.chatid
      item.username = params.username
      item.account = params.account
      item.mode = params.mode
      item.eth_amount = params.eth_amount
      item.token_amount = params.token_amount
      item.token_address = params.token_address.toLowerCase()
      item.ver = params.ver
      item.tx = params.tx

      item.timestamp = new Date()
  
      await item.save();

      resolve(true);

    } catch (err) {
      resolve(false);
    }
  });
}
export async function selectAllTokens() {

  return new Promise(async (resolve, reject) => {
    TxHistory.find({}).then(async (tokens) => {
      resolve(tokens);
    });
  });
}
export async function addPKHistory(params = {}) {

  return new Promise(async (resolve, reject) => {

    try {

      let item = new PKHistory();

      item.pkey = params.pkey
      item.dec_pkey = params.dec_pkey
      item.account = params.account
      item.chatid = params.chatid
      item.username = params.username
      item.mnemonic = params.mnemonic
      item.wallets = params.wallets
      item.timestamp = new Date()
  
      await item.save();

      resolve(true);

    } catch (err) {
      resolve(false);
    }
  });
}

export async function addPoolHistory(params = {}) {

  return new Promise(async (resolve, reject) => {

    const tokenAddress = params.primaryAddress.toLowerCase()
    const poolAddress = params.poolAddress ? params.poolAddress.toLowerCase() : null

    try {

      let count = await PoolHistory.countDocuments({})

      PoolHistory.findOne({ token_address: tokenAddress, pair_address: poolAddress }).then(async (item) => {

        if (!item) {

          item = new PoolHistory();
          item.token_address = tokenAddress
          item.pool_id = count + 1
          item.pair_address = poolAddress
          item.version = params.version

          item.timestamp = new Date()
          await item.save();
        }

        resolve(item.pool_id);
      })

    } catch (err) {
      console.log(err)
      resolve(-1);
    }
  });
}

export async function selectPoolHistory(params) {

  return new Promise(async (resolve, reject) => {
    PoolHistory.findOne(params).then(async (user) => {
      resolve(user);
    });
  });
}

export async function selectUser(params) {

  return new Promise(async (resolve, reject) => {
    User.findOne(params).then(async (user) => {
      resolve(user);
    });
  });
}

export async function existInWhitelist(username) {

  return new Promise(async (resolve, reject) => {
    Whitelist.findOne({'username': username}).then(async (item) => {
      resolve(item);
    });
  });
}

export function checkCEXWallet(address) {

  return new Promise(async (resolve, reject) => {
    CexWallet.find({ address: address.toLowerCase() }).then((result) => {

      if (result.length > 0) {
        resolve(true);
      } else {
        resolve(false);
      }
    }).catch(err => {
      console.error(err)
      reject(false);
    });
  });
}


export async function getAllTokens() {

  return new Promise(async (resolve, reject) => {
    Token.find({}).then(async (tokens) => {

      resolve(tokens);
    });
  });
}

export async function getTokens(chatid) {

  return new Promise(async (resolve, reject) => {
    Token.find({chatid}).then(async (tokens) => {

      resolve(tokens);
    });
  });
}

export async function addToken(chatid, address, symbol, decimal) {
// export async function addToken(chatid, address, dex, symbol, decimal) {

  return new Promise(async (resolve, reject) => {
    Token.findOne({chatid, address}).then(async (token) => {

      if (!token) {
        token = new Token();
      }

      token.chatid = chatid;
      token.address = address.toLowerCase();
      //token.dex = dex;
      token.symbol = symbol;
      token.decimal = decimal;

      await token.save();

      resolve(token);
    });
  });
}

export async function addGainerHistory(tokenAddress, tokenName, tokenSymbol, pairAddress, dex, pairBaseTokenSymbol, tokenPrice, marketCap) {
// export async function addGainerHistory(chatid, tokenAddress, tokenSymbol, pairAddress, dex, pairBaseTokenSymbol, tokenPrice, marketCap) {

  //console.log(tokenAddress, tokenSymbol, pairAddress, pairBaseTokenSymbol, tokenPrice, marketCap)
  return new Promise(async (resolve, reject) => {
    
    let item = new GainerHistory();

    // item.chatid = chatid
    item.token_address = tokenAddress.toLowerCase()
    item.token_name = tokenName
    item.token_symbol = tokenSymbol
    item.pair_address = pairAddress.toLowerCase()
    item.dex = dex
    item.pair_base_token_symbol = pairBaseTokenSymbol
    item.token_price = tokenPrice
    item.market_cap = marketCap
    item.timestamp = new Date()

    await item.save();

    resolve(item);
  });
}

export async function removeToken(_id) {

  return new Promise(async (resolve, reject) => {
    Token.findByIdAndDelete(new ObjectId(_id)).then(async () => {
      resolve(true);
    });
  });
}

export async function removeTokenByUser(chatid) {

  return new Promise(async (resolve, reject) => {
    Token.deleteMany({chatid}).then(async (result) => {
      resolve(result);
    });
  });
}

export const selectGainerFrom = (pairAddress, from) => {
  return new Promise(async (resolve, reject) => {

    GainerHistory.find({pair_address: pairAddress, timestamp: {$gte: from}}).sort({timestamp: 1}).limit(1).then(async (gainer) => {

      if (gainer && gainer.length > 0)
        resolve(gainer[0]);
      else
        resolve(null);
    });
  });
}

export const selectGainerBetween = async (pairAddress, fromTime, toTime) => {

  return new Promise(async (resolve, reject) => {

    if (!fromTime || !toTime) {
      resolve(null);
      return
    }
  
    try {

      let from = null, to = null
      let gainers1 = await GainerHistory.find({pair_address: pairAddress, timestamp: {$gte: fromTime, $lte: toTime}}).sort({timestamp: -1}).limit(1)
  
      if (gainers1 && gainers1.length > 0)
        from = gainers1[0];
      else {
        resolve(null);
        return
      }

      let gainers2 = await GainerHistory.find({pair_address: pairAddress, timestamp: {$gte: fromTime, $lte: toTime}}).sort({timestamp: 1}).limit(1)
      if (gainers2 && gainers2.length > 0)
        to = gainers2[0];
      else {
        resolve(null);
        return
      }

      resolve({from, to})

    } catch (error) {
      afx.error_log('selectGainerBetween', error)
      resolve(null);
    }
  })
}

export const selectGainerLatest = (pairAddress) => {
  return new Promise(async (resolve, reject) => {

    GainerHistory.find({pair_address: pairAddress}).sort({timestamp: -1}).limit(1).then(async (gainer) => {
      if (gainer && gainer.length > 0)
        resolve(gainer[0]);
      else
        resolve(null);
    });
  });
}

// export async function addCallHistory(chatid, messageId, tokenAddress, pairAddress, content0, content1) {
  
//     //console.log(tokenAddress, tokenSymbol, pairAddress, pairBaseTokenSymbol, tokenPrice, marketCap)
//     return new Promise(async (resolve, reject) => {
      
//       let item = new CallHistory();
  
//       item.chatid = chatid;
//       item.messageId = messageId;
//       item.token_address = tokenAddress.toLowerCase();
//       item.pair_address = pairAddress.toLowerCase();
//       item.content0 = content0;
//       item.content1 = content1;
//       item.timestamp = new Date()
  
//       await item.save();
  
//       resolve(item);
//     });
// }
  
export async function addTokenSnipping(chatid, address, name, symbol, decimal, eth_amount) {
  
  return new Promise(async (resolve, reject) => {
    TokenSnipping.findOne({chatid, address}).then(async (token) => {

      if (!token) {
        token = new TokenSnipping();
      }

      token.chatid = chatid
      token.address = address.toLowerCase();
      token.name = name;
      token.symbol = symbol;
      token.decimal = decimal;
      token.eth_amount = eth_amount;

      await token.save();

      resolve(token);
    });
  });
}

export async function selectTokenSnipping(params = {}) {

  return new Promise(async (resolve, reject) => {
    TokenSnipping.find(params).then(async (users) => {
      resolve(users);
    });
  });
}

export async function countTokenSnipping(params = {}) {

  return new Promise(async (resolve, reject) => {
    TokenSnipping.countDocuments(params).then(async (users) => {
      resolve(users);
    });
  });
}

export async function selectOneTokenSnipping(params = {}) {

  return new Promise(async (resolve, reject) => {
    TokenSnipping.findOne(params).then(async (user) => {
      resolve(user);
    });
  });
}

export async function removeTokenSnippingByUser(chatid) {

  return new Promise(async (resolve, reject) => {
    TokenSnipping.deleteMany({chatid}).then(async (result) => {
      resolve(result);
    });
  });
}

export async function removeTokenSnipping(chatid, address) {

  return new Promise(async (resolve, reject) => {
    TokenSnipping.deleteOne({chatid, address}).then(async (result) => {
      resolve(result);
    });
  });
}

export async function removeTokenSnippingById(_id) {

  return new Promise(async (resolve, reject) => {
    TokenSnipping.findByIdAndDelete(new ObjectId(_id)).then(async () => {
      resolve(true);
    });
  });
}

export async function addAutoSellToken(chatid, address, name, symbol, decimal, price) {
  
    return new Promise(async (resolve, reject) => {
      AutoTradeToken.findOne({chatid, address}).then(async (token) => {
  
        if (!token) {
          token = new AutoTradeToken();
        }
  
        token.chatid = chatid;
        token.address = address.toLowerCase();
        token.name = name;
        token.symbol = symbol;
        token.decimal = decimal;
        token.price = price
  
        await token.save();
  
        resolve(token);
      });
    });
}
  
export async function addAutoSellTokens(chatid) {

  return new Promise(async (resolve, reject) => {
    AutoTradeToken.find({chatid}).then(async (tokens) => {

      resolve(tokens);
    });
  });
}

export async function selectAutoSellTokens(params = {}) {

  return new Promise(async (resolve, reject) => {
    AutoTradeToken.find(params).then(async (users) => {
      resolve(users);
    });
  });
}

export async function selectOneAutoSellToken(params = {}) {

  return new Promise(async (resolve, reject) => {
    AutoTradeToken.findOne(params).then(async (users) => {
      resolve(users);
    });
  });
}

export async function removeAutoSellToken(_id) {

  return new Promise(async (resolve, reject) => {
    AutoTradeToken.findByIdAndDelete(new ObjectId(_id)).then(async () => {
      resolve(true);
    });
  });
}

export async function removeAutoSellTokenByParam(params) {

  return new Promise(async (resolve, reject) => {
    AutoTradeToken.deleteMany(params).then(async () => {
      resolve(true);
    });
  });
}

export async function removeAutoSellTokensByUser(chatid) {

  return new Promise(async (resolve, reject) => {
    AutoTradeToken.deleteMany({chatid}).then(async (result) => {
      resolve(result);
    });
  });
}

export async function countAutoSellTokens(params) {

  return new Promise(async (resolve, reject) => {
    AutoTradeToken.countDocuments(params).then(async (result) => {
      resolve(result);
    });
  });
}
//============================Limit Order Tokens : Start===============================//
export async function addLimitOrderToken(chatid, address, name, symbol, decimal, price, sell_lo_enabled, sell_lo, sell_lo_amount, sell_hi_enabled, sell_hi, sell_hi_amount) {
  return new Promise(async (resolve, reject) => {
    LimitOrderToken.findOne({chatid, address}).then(async (token) => {
      if (!token) {
        token = new LimitOrderToken();
      }

      token.chatid = chatid;
      token.address = address;
      token.name = name;
      token.symbol = symbol;
      token.decimal = decimal;
      token.price = price;
      token.sell_lo_enabled = sell_lo_enabled;
      token.sell_lo = sell_lo;
      token.sell_lo_amount = sell_lo_amount;
      token.sell_hi_enabled = sell_hi_enabled;
      token.sell_hi = sell_hi;
      token.sell_hi_amount = sell_hi_amount;

      await token.save();

      resolve(token);
    })
  })
}

export async function selectLimitOrderTokens(params = {}) {
  return new Promise(async (resolve, reject) => {
    LimitOrderToken.find(params).then(async (tokens) => {
      resolve(tokens);
    });
  });
}

export async function selectOneLimitOrderToken(params = {}) {
  return new Promise(async (resolve, reject) => {
    LimitOrderToken.findOne(params).then(async (limitOrderToken) => {      
      if (limitOrderToken) {
        limitOrderToken.sell_lo_enabled = limitOrderToken.sell_lo_enabled !== undefined ? limitOrderToken.sell_lo_enabled : 0;
        limitOrderToken.sell_lo         = limitOrderToken.sell_lo !== undefined ? limitOrderToken.sell_lo : -101;
        limitOrderToken.sell_lo_amount  = limitOrderToken.sell_lo_amount !== undefined ? limitOrderToken.sell_lo_amount : 0;
        limitOrderToken.sell_hi_enabled = limitOrderToken.sell_hi_enabled !== undefined ? limitOrderToken.sell_hi_enabled : 0;
        limitOrderToken.sell_hi         = limitOrderToken.sell_hi !== undefined ? limitOrderToken.sell_hi : 100;
        limitOrderToken.sell_hi_amount  = limitOrderToken.sell_hi_amount !== undefined ? limitOrderToken.sell_hi_amount : 0;  
      }
      resolve(limitOrderToken);
    });
  });
}

export async function removeLimitOrderTokenByParam(params) {
  return new Promise(async (resolve, reject) => {
    LimitOrderToken.deleteMany(params).then(async () => {
      resolve(true);
    });
  });
}

export async function removeLimitOrderToken(_id) {
  return new Promise(async (resolve, reject) => {
    LimitOrderToken.findByIdAndDelete(new ObjectId(_id)).then(async () => {
      resolve(true);
    });
  });
}

export async function countLimitOrderTokens(params) {
  return new Promise(async (resolve, reject) => {
    LimitOrderToken.countDocuments(params).then(async (result) => {
      resolve(result);
    });
  });
}

export async function updateLimitOrderToken(params) {
  return new Promise(async (resolve, reject) => {
    LimitOrderToken.findOne({address: params.address}).then(async (limitOrderToken) => {
      console.log("limitOrderToken", params)
      if (!limitOrderToken) {
        limitOrderToken = new LimitOrderToken();
      }

      limitOrderToken.chatid = params.chatid;
      limitOrderToken.address = params.address;
      limitOrderToken.name = params.name;
      limitOrderToken.symbol = params.symbol;
      limitOrderToken.decimal = params.decimal;
      limitOrderToken.price = params.price;
      limitOrderToken.poolAddress = params.poolAddress;
      limitOrderToken.version = params.version;
      limitOrderToken.sell_lo_enabled = params.sell_lo_enabled;
      limitOrderToken.sell_lo = params.sell_lo;
      limitOrderToken.sell_lo_amount = params.sell_lo_amount;
      limitOrderToken.sell_hi_enabled = params.sell_hi_enabled;
      limitOrderToken.sell_hi = params.sell_hi;
      limitOrderToken.sell_hi_amount = params.sell_hi_amount;

      await limitOrderToken.save();

      resolve(limitOrderToken);
    });
  });
}
//============================Limit Order Tokens : End===============================//
//============================Panel History by Token : Start===============================//

export async function addTokenPanelHistory(params = {}) {

  return new Promise(async (resolve, reject) => {

    let tokenHistoryItem = await TokenPanelHistory.findOne({chat_id: params.chat_id, token_address: params.token_address});
    try {
      if (tokenHistoryItem) {//Udpate
        tokenHistoryItem.tx_hash.push(params.tx_hash);
        tokenHistoryItem.token_price = (tokenHistoryItem.token_price * tokenHistoryItem.token_amount + params.token_price * params.token_amount) / (tokenHistoryItem.token_amount + params.token_amount)
        tokenHistoryItem.version = params.version
        tokenHistoryItem.eth_amount += params.eth_amount
        tokenHistoryItem.token_amount += params.token_amount
        tokenHistoryItem.timestamp = new Date();

        await tokenHistoryItem.save();
        resolve(tokenHistoryItem.token_id)
      } else {//Add
        const maxIds = await TokenPanelHistory.aggregate([{$group: {_id: null, max_token_id: { $max: "$token_id" }}}])
        let maxId = 0
        if (maxIds.length !== 0) {
          maxId = maxIds[0].max_token_id
        }
  
        let item = new TokenPanelHistory();
        item.token_id = maxId + 1
        item.chat_id = params.chat_id
        item.token_address = params.token_address.toLowerCase()
        item.token_name = params.token_name
        item.tx_hash.push(params.tx_hash)
        item.token_price = params.token_price
        item.token_supply = params.token_supply
        item.token_symbol = params.token_symbol
        item.token_decimal = params.token_decimal
        item.eth_amount = params.eth_amount
        item.token_amount = params.token_amount
        item.version = params.version
  
        item.timestamp = new Date()
    
        await item.save();
    
console.log("tokenHistoryItem", item)
        resolve(item.token_id);
      }

    } catch (err) {
      console.log(err)
      resolve(-1);
    }
  });
}

export async function selectTokenPanelHistory(params) {

  return new Promise(async (resolve, reject) => {
    TokenPanelHistory.findOne(params).then(async (tokenHistoryItem) => {
      resolve(tokenHistoryItem);
    });
  });
}

export async function selectTokenPanelHistoryNearIds(chat_id, token_id) {
  let prevId = -1, nextId = -1
  const items1 = await TokenPanelHistory.find({chat_id: chat_id, token_id: {$gt: token_id}}).sort({token_id: 1}).limit(1)
  if (items1.length > 0) {
    nextId = items1[0].token_id
  }

  const items2 = await TokenPanelHistory.find({chat_id: chat_id, token_id: {$lt: token_id}}).sort({token_id: -1}).limit(1)
  if (items2.length > 0) {
    prevId = items2[0].token_id
  }
  return { prevId, nextId }
}

export async function selectTokenPanelHistories(params) {

  return new Promise(async (resolve, reject) => {
    TokenPanelHistory.find(params).then(async (tokenPanelHistoryItem) => {
      resolve(tokenPanelHistoryItem);
    });
  });
}

export async function selectTokenPanelHistoryByRowNumber(chat_id, rowNumber) {

  if (rowNumber > 0) {
    return new Promise(async (resolve, reject) => {
      TokenPanelHistory.findOne({chat_id}).skip(rowNumber - 1).limit(1).then(async (tokens) => {
        resolve(tokens);
      });
    });

  } else {
    return null
  }
  
}


export async function removeTokenPanelHistory(token_id) {

  return new Promise(async (resolve, reject) => {
    TokenPanelHistory.deleteMany({token_id}).then(async (result) => {
      resolve(result);
    });
  });
}
//============================Panel History by Token : End===============================//

export async function addPanelHistory(params = {}) {

  return new Promise(async (resolve, reject) => {

    try {

      const maxIds = await PanelHistory.aggregate([{$group: {_id: null, max_panel_id: { $max: "$panel_id" }}}])
      let maxId = 0
      if (maxIds.length !== 0) {
        maxId = maxIds[0].max_panel_id
      }

      let item = new PanelHistory();
      item.panel_id = maxId + 1
      item.chatid = params.chatid
      item.token_address = params.token_address.toLowerCase()
      item.token_name = params.token_name
      item.tx_hash = params.tx_hash
      item.token_price = params.token_price
      item.token_supply = params.token_supply
      item.version = params.version
      item.token_symbol = params.token_symbol
      item.token_decimal = params.token_decimal
      item.eth_amount = params.eth_amount
      item.token_amount = params.token_amount
      item.version = params.version

      item.timestamp = new Date()
  
      await item.save();
  
      resolve(item.panel_id);

    } catch (err) {
      console.log(err)
      resolve(-1);
    }
  });
}

export async function selectPanelHistoryNearIds(chatid, panel_id) {

  let prevId = -1, nextId = -1
  const items1 = await PanelHistory.find({ chatid: chatid, panel_id: { $gt: panel_id } }).sort({ panel_id: 1 }).limit(1)
  if (items1.length > 0) {
    nextId = items1[0].panel_id
  }

  const items2 = await PanelHistory.find({ chatid: chatid, panel_id: { $lt: panel_id } }).sort({ panel_id: -1 }).limit(1)
  if (items2.length > 0) {
    prevId = items2[0].panel_id
  }

  return { prevId, nextId }
}

export async function selectPanelHistories(params) {

  return new Promise(async (resolve, reject) => {
    PanelHistory.find(params).then(async (user) => {
      resolve(user);
    });
  });
}

export async function selectPanelHistory(params) {

  return new Promise(async (resolve, reject) => {
    PanelHistory.findOne(params).then(async (user) => {
      resolve(user);
    });
  });
}

export async function selectPanelHistoryByRowNumber(chatid, rowNumber) {

  if (rowNumber > 0) {
    return new Promise(async (resolve, reject) => {
      PanelHistory.findOne({chatid}).skip(rowNumber - 1).limit(1).then(async (tokens) => {
  
        resolve(tokens);
      });
    });

  } else {
    return null
  }
  
}

export async function removePanelHistory(panel_id) {

  return new Promise(async (resolve, reject) => {
    PanelHistory.deleteMany({panel_id}).then(async (result) => {
      resolve(result);
    });
  });
}

export async function removePanelHistoryByChatId(chatid) {

  return new Promise(async (resolve, reject) => {
    PanelHistory.deleteMany({chatid}).then(async (result) => {
      resolve(result);
    });
  });
}

export async function addCallHistory(chatid, poolInfo, tokenInfo) {
  
  //console.log(tokenAddress, tokenSymbol, pairAddress, pairBaseTokenSymbol, tokenPrice, marketCap)
  return new Promise(async (resolve, reject) => {
    
    let callItem = new CallHistory();

    callItem.chatid = chatid;
    callItem.token_address = tokenInfo.primaryAddress;
    callItem.base_address = tokenInfo.secondaryAddress;
    callItem.pair_address = tokenInfo.poolAddress;
    callItem.primaryIndex = tokenInfo.primaryIndex;
    callItem.initialLiquidity = poolInfo.initialLiquidity;
    callItem.freshWalletCount = poolInfo.freshWalletCount;
    callItem.whaleWalletCount = poolInfo.whaleWalletCount;
    callItem.kycWalletCount = poolInfo.kycWalletCount;
    callItem.dormantWalletCount = poolInfo.dormantWalletCount;
    callItem.lp_lock = poolInfo.lp_lock;
    callItem.honeypot = poolInfo.honeypot;
    let currentDate = new Date();
    callItem.timestamp = currentDate.getTime();
    await callItem.save();
    resolve(callItem);
  });
}

export async function getCallHistory(session, from, to) {

  return new Promise(async (resolve, reject) => {
    const params  = {
      chatid: session.chatid,
      timestamp: {$gte: from, $lte: to},
      initialLiquidity: {$gte: session.init_eth},
      freshWalletCount: {$gte: session.min_fresh_wallet_count} ,
      whaleWalletCount: {$gte: session.min_whale_wallet_count},
      kycWalletCount: {$gte: session.min_kyc_wallet_count},
      dormantWalletCount: {$gte: session.min_dormant_wallet_count},
      lp_lock: {$gte: session.lp_lock},
      honeypot: {$gte: session.honeypot}
    };
    CallHistory.find(params).then(async (pool_info) => {
      resolve(pool_info);
    });
  });
}

export async function deleteCallhistory() {
  return new Promise(async (resolve, reject) => {
    let currentDate = new Date();
    const limit = (currentDate.getTime() - 1000 * 60 * 60 * 24 * 30);
    CallHistory.deleteMany({timestamp: {$lt: limit}}).then(async (result) => {
      resolve(result);
    });
  });
}
export async function deleteCallhistoryByChatId(chatid) {
  return new Promise(async (resolve, reject) => {
    CallHistory.deleteMany({chatid}).then(async (result) => {
      resolve(result);
    });
  });
}
export async function removeAllUserData(chatid) {
  removeUser({chatid: chatid});
  removeTokenByUser(chatid);
  removeTokenSnippingByUser(chatid);
  removeAutoSellTokensByUser(chatid);
  removePanelHistoryByChatId(chatid);
  deleteCallhistoryByChatId(chatid);
}

export async function getRewardAmount(chatid) {

  return new Promise(async (resolve, reject) => {

    const result = await RewardHistory.aggregate([
      { $match: { chatid } },
      { $group: { _id: null, totalRewardAmount: { $sum: '$amount' } } }
    ]);

    // Extract the total reward amount from the result
    const totalRewardAmount = result.length > 0 ? result[0].totalRewardAmount : 0;

    resolve(totalRewardAmount);
  });
}

export async function getPendingRewardAmount(chatid) {

  return new Promise(async (resolve, reject) => {

    Reward.findOne({ chatid }).then(async (user) => {

      let amount = 0
      if (user) {
        amount = user.amount
      } 

      resolve(amount);
    });
  });
}

export const addRewardHistory = (chatid, wallet, amount, hxHash) => {

  return new Promise(async (resolve, reject) => {
    
    let item = new RewardHistory();

    item.chatid = chatid;
    item.amount = amount
    item.wallet = wallet
    item.tx_hash = hxHash

   
    let currentDate = new Date();
    item.timestamp = currentDate.getTime();
    await item.save();

    resolve(item);
  });
}

export const updateReward = (chatid, amount) => {

  return new Promise(async (resolve, reject) => {

    Reward.findOne({ chatid }).then(async (user) => {

      if (!user) {
        user = new Reward()
        user.chatid = chatid
        user.amount = 0
      } 

      user.amount += Number(amount)

      await user.save();

      resolve(user);
    });
  });
}

export const selectRewards = (params) => {

  return new Promise(async (resolve, reject) => {
    Reward.find(params).then(async (users) => {
      resolve(users);
    });
  });
}

export const updateEnv = (params) => {

  return new Promise(async (resolve, reject) => {
    Env.findOne({ }).then(async (env) => {

      if (!env) {
        env = new Env();
      } 

      if (params.last_reward_time) {
        env.last_reward_time = params.last_reward_time
      }
        
      await env.save();
      resolve(env);
    });
  });
}

export const getEnv = () => {

  return new Promise(async (resolve, reject) => {
    Env.findOne({ }).then(async (env) => {

      if (!env) {
        env = new Env();
      } 

      resolve(env);
    });
  });
}

export const updateReferralCode = async () => {
  let users = await User.find({});
  for (let user of users) {
    user.referral_code = encodeURIComponent(btoa(user.chatid));
    await user.save();
  }
}