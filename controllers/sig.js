require('dotenv').config();
const Evee = require('../contracts/Evee.json');
const EveeNFT = require('../contracts/EveeNFT.json');
const Recipiant = require('../contracts/Recipiant.json');
const { FeeMarketEIP1559Transaction } = require('@ethereumjs/tx');
const Common = require('@ethereumjs/common').default;
const { Chain, Hardfork } = require('@ethereumjs/common');
const { createAlchemyWeb3 } = require('@alch/alchemy-web3');
//const addressOf_0_Com = '0x5f800273a982124658932Dd29002D88ac6Cc7992'
const maxGasPerTX = 1200000;
const gasEstimation = require('./gasEstimation');
const alchUrl = `https://polygon-mumbai.g.alchemy.com/v2/${process.env.ALCH_KEY}`;
const infuraUrl = `https://goerli.infura.io/v3/${process.env.INFURA_URL}`;
const maxString =
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ';
const sigUtil = require('eth-sig-util');
const fs = require('fs');
const timeout = 100

exports.getAccountsRecover = async (req, res, next) => {
  let proxySlavePkey = 0;
  let ChoosenCom = 0;
  let senderVerifyed = false
  return_val = false;
  try {
    console.log('INTERCEPTED SIG URL');

    //const provider = infuraUrl;
    const web3 = createAlchemyWeb3(alchUrl);
    const networkId = await web3.eth.net.getId();
    console.log('networkId', networkId);
    console.log(
      'Recipiant.networks[networkId].address',
      Recipiant.networks[networkId].address
    );
    const RcipiantContract = new web3.eth.Contract(
      Recipiant.abi,
      Recipiant.networks[networkId].address
    );
    const eveeContract = new web3.eth.Contract(
      Evee.abi,
      Evee.networks[networkId].address
    );
    const eveeNFTInstance = new web3.eth.Contract(
      EveeNFT.abi,
      EveeNFT.networks[networkId].address
    );

    const account = web3.eth.accounts.privateKeyToAccount(
      process.env.E_WALLET_PKEY
    );
    console.log('sagi' ,account.address)

    const block = await web3.eth.getBlock('pending');
    const baseFee = parseInt(block.baseFeePerGas);
    const priorityFee = parseInt(await web3.eth.getMaxPriorityFeePerGas());
    const MaxFee = parseInt(1.5 * baseFee + priorityFee);
    console.log('MaxFeePerGas', MaxFee);

    const masterProxy = account.address;

    const gasEst = await gasEstimation.getGasEstimation(null, null, null);
    console.log('gasEst', gasEst);

    try {
      await lockSem('semaphore.lock');
      ChoosenCom = await getCommercial(eveeContract,masterProxy,req,gasEst,MaxFee);
      if (ChoosenCom == 0) throw 'NO COMMERCIAL!!!!!!!!!!!!!!!!!!';
      if (! (await senderVerifivatopn(req.body.signer))){ throw 'sender already in use!!!!!!!!!!!!!!!!!!'};
      senderVerifyed = true
    } catch (err) {
      await unlockSem('semaphore.lock');
      console.log(err);
      return_val = res.status(500).json({ message: err })
      return return_val;
    }
      await unlockSem('semaphore.lock');
    

    //unlock semaphore
    proxySlavePkey = await GetProxyAdd();
    const proxySlaveAccount =
      web3.eth.accounts.privateKeyToAccount(proxySlavePkey);
    const proxySlavePkeyBuffer = Buffer.from(proxySlavePkey, 'hex');
    await setWhiteList(
      web3,
      eveeContract,
      account,
      process.env.E_WALLET_PKEY,
      proxySlaveAccount,
      MaxFee
    );

    const freeSendMessegeData = await eveeContract.methods
      .freeSendMessege(
        req.body.v,
        req.body.r,
        req.body.s,
        req.body.signer,
        masterProxy,
        req.body.contract_of_remote,
        req.body.deadline,
        req.body.nonce,
        req.body.txData,
        ChoosenCom
      )
      .encodeABI();
    //Test if transaction will fail
    const gasEstTest = await web3.eth.estimateGas({
      to: eveeContract._address,
      from: proxySlaveAccount.address,
      data: freeSendMessegeData,
    });
    //Can comapre to real cosr
    console.log('general gas estimation  =  ',gasEst );
    console.log('real gas estimation        =  ',gasEstTest );
    console.log('general cost estimation  =  ',gasEst*MaxFee );
    console.log('real cost estimation        =  ',gasEstTest*MaxFee );
    const gasLimitHex = web3.utils.toHex(maxGasPerTX);
    const txCount = await web3.eth.getTransactionCount(
      proxySlaveAccount.address,
      'pending'
    );
    const transaction = {
      from: proxySlaveAccount.address,
      maxFeePerGas: web3.utils.toHex(MaxFee),
      maxPriorityFeePerGas: web3.utils.toHex(MaxFee),
      gasLimit: gasLimitHex,
      to: eveeContract._address,
      data: freeSendMessegeData,
    };

    //const common = new Common({
    //  chain: Chain.Goerli,
    //  hardfork: Hardfork.London,
    //});
    const common = Common.custom({ chainId: 80001 }, { hardfork: Hardfork.London })
    const tx = FeeMarketEIP1559Transaction.fromTxData(
      { ...transaction, nonce: web3.utils.toHex(txCount) },
      { common }
    );

    const singedTx = tx.sign(proxySlavePkeyBuffer);
    const serializedTx = singedTx.serialize().toString('hex');
    const account_balance_prior_to_send = await web3.eth.getBalance(
      proxySlaveAccount.address
    );

    const receipt = await web3.eth.sendSignedTransaction(
      '0x' + serializedTx,
      (err, hash) => {
        if (err) {
          console.log(err);
          throw err;
        }
        console.log(
          'contract creation tx: ' + hash,
          ' from account: ',
          proxySlaveAccount.address
        );
      }
    );
    //console.log(receipt, 'contract created successfully')
    await realeaseProxyAdd(proxySlavePkey);

    const account_balance_post_to_send = await web3.eth.getBalance(
      proxySlaveAccount.address
    );
    console.log(
      'account balance prior to send',
      web3.utils.fromWei(account_balance_prior_to_send)
    );
    console.log(
      'account balance post to send',
      web3.utils.fromWei(account_balance_post_to_send)
    );
    console.log(
      'diff in account balance after transaction : ',
      web3.utils.fromWei(account_balance_post_to_send) -
        web3.utils.fromWei(account_balance_prior_to_send)
    );
    await realeaseProxyAdd(proxySlavePkey);
  } catch (errorrr) {
  
    console.log(errorrr);
    return_val = res.status(500).json({ message: errorrr.message })
    
  }
  finally{
    await realeaseProxyAdd(proxySlavePkey);
    

      await lockSem('semaphore.lock');
      if (ChoosenCom != 0){//remove com from list
      const comDict = await getCommercialsSharedData();
      for (let i = 0; i < comDict.ComsArray.length; i++) {
        if (comDict.ComsArray[i] == String(ChoosenCom)) {
          comDict.ComsArray.splice(i);
        }
      }
      console.log(comDict.ComsArray);
      await writeCommercialsSharedData(comDict);
      }
      if (senderVerifyed){//remove sender from list
        const sendersDict = await getSendersSharedData();
        for (let i = 0; i < sendersDict.sendersArray.length; i++) {
          if (sendersDict.sendersArray[i] == req.body.signer) {
            sendersDict.sendersArray.splice(i);
          }
        }
        console.log(sendersDict.sendersArray);
        await writeSendersSharedData(sendersDict);
    }


      await unlockSem('semaphore.lock');
      if (return_val)
        return return_val;
    

  }

  next();
};












const lockSem = async (semFile) => {
  console.log('attemting semaphore lock');
  let locked = false;
  while (!locked) {
    try {
      f = await fs.promises.open(semFile, 'wx');
      f.close();
      console.log('lock obtained', semFile);
      locked = true;
    } catch (error) {
      //console.log(error);
      console.log('failed to lock', semFile);
      locked = false;
      await new Promise((resolve) => setTimeout(resolve, timeout));
    }
  }
};

const unlockSem = async (semFile) => {
  fs.unlink(semFile, (err, jsonString) => {
    if (err) {
      console.log('lock was not deleted!!!!!!!!!!!!!!!!!!!!!!!!!!!', semFile);
      throw 'LOCK WAS NOT DELETED';
    }
    console.log('lock was deleted :)', semFile);
  });
};

const getCommercialsSharedData = async () => {
  const _comDict = await fs.promises.readFile(
    './MultiProcComs.json',
    'utf8',
    (err, jsonString) => {
      if (err) {
        console.log('File read failed:', err);
        throw err;
      }
      console.log('File data:', jsonString);
      return JSON.parse(jsonString);
    }
  );
  console.log('_comDict', _comDict);
  return JSON.parse(_comDict);
};


const getSendersSharedData = async () => {
  const _sendersDict = await fs.promises.readFile(
    './MultiProcSenders.json',
    'utf8',
    (err, jsonString) => {
      if (err) {
        console.log('File read failed:', err);
        throw err;
      }
      console.log('File data:', jsonString);
      return JSON.parse(jsonString);
    }
  );
  console.log('_comDict', _sendersDict);
  return JSON.parse(_sendersDict);
};

const writeCommercialsSharedData = async (comDict) => {
  await fs.promises.writeFile(
    'MultiProcComs.json',
    JSON.stringify(comDict),
    function (err, result) {
      if (err) console.log('error', err);
    }
  );
};

const writeSendersSharedData = async (sendersDict) => {
  await fs.promises.writeFile(
    'MultiProcSenders.json',
    JSON.stringify(sendersDict),
    function (err, result) {
      if (err) console.log('error', err);
    }
  );
};



const GetProxyAdd = async () => {
  let proxy = 0;
  let porxys;
  let bool = true;
  try {
    while (bool) {
    await lockSem('ProxySem.lock');
    porxys = await fs.promises.readFile(
      'MultiProcProxysIndex.txt',
      'utf8',
      function (err, result) {
        if (err) console.log('error', err);
      }
    );
    porxys = porxys.split(' ');
    console.log('porxys', porxys);
    indexes = String(porxys).split(' ');
    for (i in porxys) {
      if (porxys[i].split('-').length < 2) break;
      console.log('trying ', porxys[i]);
      if (porxys[i].split('-')[1] == 0) {
        console.log('found', porxys[i].split('-')[0]);
        proxy = porxys[i].split('-')[0];
        bool = false;
        break;
      }
    }
    if (bool) {
      unlockSem('ProxySem.lock');
      await new Promise((resolve) => setTimeout(resolve, timeout));
    }
  }

  //porxys = await fs.promises.readFile("MultiProcProxysIndex.txt", 'utf8', function(err, result) {
  //      if(err) console.log('error', err);
  //      });
  fs.writeFile('MultiProcProxysIndex.txt', '', function (err, result) {
    if (err) console.log('error', err);
  });
  for (i in porxys) {
    if (porxys[i].split('-').length < 2) break;
    if (porxys[i].split('-')[0] != proxy) await AddIndex(porxys[i]);
    else await AddIndex(proxy + '-' + '1');
  }
} catch (err) {
  unlockSem('ProxySem.lock');
  throw err;
}
unlockSem('ProxySem.lock');
return proxy;
};

const realeaseProxyAdd = async (proxy) => {
if (proxy == 0) return;
try {
  await lockSem('ProxySem.lock');
  porxys = await fs.promises.readFile(
    'MultiProcProxysIndex.txt',
    'utf8',
    function (err, result) {
      if (err) console.log('error', err);
    }
  );
  porxys = porxys.split(' ');
  fs.writeFile('MultiProcProxysIndex.txt', '', function (err, result) {
    if (err) console.log('error', err);
  });
  for (i in porxys) {
    if (porxys[i].split('-')[0] != proxy) await AddIndex(porxys[i]);
    else await AddIndex(proxy + '-' + '0');
  }
} catch (err) {
  unlockSem('ProxySem.lock');
  throw err;
}
unlockSem('ProxySem.lock');
};

const AddIndex = async (stringg) => {
await fs.promises.appendFile('MultiProcProxysIndex.txt', stringg + ' ');
};

async function setWhiteList(
web3,
eveeContract,
master_proxy,
master_proxy_pkey,
slave_proxy,
MaxFee
) {
const isWhiteListed = await eveeContract.methods
  .inWhiteList(master_proxy.address)
  .call({ from: slave_proxy.address });
console.log('isWhiteListed', isWhiteListed);
if (!isWhiteListed) {
  console.log('adding ot whitelist');
  const TX = await eveeContract.methods
    .addToWhiteList(slave_proxy.address)
    .encodeABI();
  await sendTXWithPkey(
    web3,
    master_proxy,
    TX,
    0,
    eveeContract,
    master_proxy_pkey,
    MaxFee
  );
} else console.log('already white listed');
}

async function sendTXWithPkey(web3, account, abi, amount, to, pkey, MaxFee) {
const transaction = {
  from: account.address,
  maxFeePerGas: await web3.utils.toHex(MaxFee),
  maxPriorityFeePerGas: await web3.utils.toHex(MaxFee),
  to: to._address,
  data: abi,
  gasLimit: await web3.utils.toHex(6000000),
  value: amount,
};

const txCount = await web3.eth.getTransactionCount(
  account.address,
  'pending'
);
//const common = new Common({
//  chain: Chain.Goerli,
//  hardfork: Hardfork.London,
//});
const common = Common.custom({ chainId: 80001 }, { hardfork: Hardfork.London })
const tx = FeeMarketEIP1559Transaction.fromTxData(
  { ...transaction, nonce: await web3.utils.toHex(txCount) },
  { common }
);
const singedTx = tx.sign(Buffer.from(pkey, 'hex'));
const serializedTx = singedTx.serialize().toString('hex');
console.log('preparing to send');
const receipt = await web3.eth.sendSignedTransaction(
  '0x' + serializedTx,
  (err, hash) => {
    if (err) {
      console.log(err);
      return;
    }
    console.log('sending tx, hash : ' + hash);
  }
);
}


async function  getCommercial(eveeContract,masterProxy,req,gasEst,MaxFee){
  let ChoosenCom = 0
  const comDict = await getCommercialsSharedData();
  console.log('comDict', comDict["ComsArray"]);

  const minPriceForComDevidedBy1000 = Math.ceil((gasEst * MaxFee) * (105/100) / 1000);
  //const minPriceForCom = 3
  console.log('minPriceForCom', minPriceForComDevidedBy1000*1000);
  const comId = await eveeContract.methods
    .findCommercialArr(
      masterProxy,
      req.body.contract_of_remote,
      minPriceForComDevidedBy1000,
      30
    )
    .call({ from: masterProxy });
  console.log(comId);
  const usedCounts = {};
  const allCounts = {};
  for (const num of comDict["ComsArray"]) {
    usedCounts[num] = usedCounts[num] ? usedCounts[num] + 1 : 1;
  }
  for (const num of comId) {
    allCounts[num] = allCounts[num] ? allCounts[num] + 1 : 1;
  }

  for (const comNum of comId) {
    console.log('Trying to take com ', comNum , ' used count ', usedCounts[comNum],' avilable ', allCounts[comNum])
    if ( !usedCounts[comNum] || (usedCounts[comNum] <  allCounts[comNum])) {
      ChoosenCom = comNum;
      break;
    }
  }
  if (ChoosenCom == 0)throw 'NO COMMERCIAL!!!!!!!!!!!!!!!!!!'
  console.log('Chosen com is : ', ChoosenCom);
  comDict.ComsArray.push(ChoosenCom);

  await writeCommercialsSharedData(comDict);
  return ChoosenCom;
}

async function  senderVerifivatopn(sender){
  const sendersDict = await getSendersSharedData();
  for (const add of sendersDict["sendersArray"]) {
    if (add == sender) return false;
  }
  sendersDict.sendersArray.push(sender);
  await writeSendersSharedData(sendersDict);

  return true;
}