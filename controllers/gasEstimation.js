require('dotenv').config()
const { createAlchemyWeb3 } = require('@alch/alchemy-web3')
const sigUtil = require('eth-sig-util')
const Evee = require('../contracts/Evee.json')
const Recipiant = require('../contracts/Recipiant.json')
const maxString =
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ'
exports.getGasEstimation = async (req, res, next) => {
  const {
    account,
    web3,
    contract_of_remote,
    eveeContract,
    RcipiantContract,
    pKey,
  } = await init()

  const result = await getGasEstimation(
    account,
    web3,
    contract_of_remote,
    eveeContract,
    RcipiantContract,
    pKey
  )
  if (req) {
    res.result = result
    next()
  }
  return result
}
const getGasEstimation = async (
  account,
  web3,
  contract_of_remote,
  eveeContract,
  RcipiantContract,
  pKey
) => {
  const signer = account.address
  const deadline = Date.now() + 100000
  const txData = RcipiantContract.methods.post(maxString, 0).encodeABI()

  const chainID = 5
  const msgParams = JSON.stringify({
    types: {
      EIP712Domain: [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'verifyingContract', type: 'address' },
      ],
      land: [
        { name: 'txData', type: 'bytes' },
        { name: 'sender', type: 'address' },
        { name: 'deadline', type: 'uint' },
      ],
    },
    //make sure to replace verifyingContract with address of deployed contract
    primaryType: 'land',
    domain: {
      name: 'Evee',
      version: '1',
      chainId: chainID,
      verifyingContract: contract_of_remote,
    },
    message: {
      txData: txData,
      sender: signer,
      deadline: deadline,
    },
  })

  //const params = [from, msgParams]

  //var msgHash = EthUtil.hashPersonalMessage(new Buffer(msgParams));
  const result = sigUtil.signTypedData_v4(pKey, {
    data: JSON.parse(msgParams),
  })
  //var signature = EthUtil.ecsign(msgHash, new Buffer(pkey.substring(2), 'hex'));
  const signature = result.substring(2)
  const r = '0x' + signature.substring(0, 64)
  const s = '0x' + signature.substring(64, 128)
  const v = parseInt(signature.substring(128, 130), 16)


  const recovered_res = sigUtil.recoverTypedSignature({
    data: JSON.parse(msgParams),
    sig: result,
  })

  const anyComId = await eveeContract.methods
    .findCommercialArr(
      process.env.E_WALLET_ADD_ZERO_COM,
      contract_of_remote,
      0,
      30
    )
    .call({ from: process.env.E_WALLET_ADD_ZERO_COM })
    //console.log(anyComId)
  const data = await eveeContract.methods
    .freeSendMessege(
      v,
      r,
      s,
      signer,
      process.env.E_WALLET_ADD_ZERO_COM,
      contract_of_remote,
      deadline,
      txData,
      anyComId[0]
    )
    .encodeABI()
  const gasEst = await web3.eth.estimateGas({
    to: eveeContract._address,
    from: process.env.E_WALLET_ADD_ZERO_COM,
    data: data,
  })
  return gasEst
}






const init = async () => {
  const web3 = createAlchemyWeb3(
    `https://eth-goerli.alchemyapi.io/v2/${process.env.ALCH_KEY}`
  )
  const networkId = await web3.eth.net.getId()
  const account = web3.eth.accounts.privateKeyToAccount(
    process.env.E_WALLET_PKEY
  )
  const pKey = Buffer.from(process.env.E_WALLET_PKEY, 'hex')
  const RcipiantContract = new web3.eth.Contract(
    Recipiant.abi,
    Recipiant.networks[networkId].address
  )
  const eveeContract = new web3.eth.Contract(
    Evee.abi,
    Evee.networks[networkId].address
  )
  const contract_of_remote = RcipiantContract._address
  return {
    account,
    web3,
    contract_of_remote,
    eveeContract,
    RcipiantContract,
    pKey,
  }
}
