require('dotenv').config()
const { createAlchemyWeb3 } = require('@alch/alchemy-web3')
const Evee = require('../contracts/Evee.json')
const EveeNFT = require('../contracts/EveeNFT.json')
const Recipiant = require('../contracts/Recipiant.json')

exports.getEvents = async (req, res, next) => {
  const { fromContract_add, eventName, filter_for_posts } = req.body
  const { eveeContract, RcipiantContract, EveeNFTContract } = await init(
    fromContract_add
  )
  let fromContract = 0
  if (fromContract_add == eveeContract._address) fromContract = eveeContract
  else if (fromContract_add == RcipiantContract._address)
    fromContract = RcipiantContract
  else if (fromContract_add == EveeNFTContract._address)
    fromContract = EveeNFTContract
  if (fromContract == 0) next()
  let not_done = true
  console.log('trying to get past events')
  while (not_done) {
    try {
      const ev = await fromContract.getPastEvents(eventName, filter_for_posts)
      not_done = false
      res.result = ev
      next()
    } catch (e) {
      if (e.code == -32603) {
        await new Promise((resolve) => setTimeout(resolve, 50))
        not_done = true
      } else {
        next()
      }
    }
  }
}

const init = async () => {
  const web3 = createAlchemyWeb3(
    `https://polygon-mumbai.g.alchemy.com/v2/${process.env.ALCH_KEY}`
  )
  const networkId = await web3.eth.net.getId()
  const account = web3.eth.accounts.privateKeyToAccount(
    process.env.E_WALLET_PKEY
  )
  const RcipiantContract = new web3.eth.Contract(
    Recipiant.abi,
    Recipiant.networks[networkId].address
  )
  const eveeContract = new web3.eth.Contract(
    Evee.abi,
    Evee.networks[networkId].address
  )
  const EveeNFTContract = new web3.eth.Contract(
    EveeNFT.abi,
    EveeNFT.networks[networkId].address
  )
  const contract_of_remote = RcipiantContract._address
  return {
    account,
    web3,
    contract_of_remote,
    eveeContract,
    RcipiantContract,
    EveeNFTContract,
  }
}
