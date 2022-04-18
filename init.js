require('dotenv').config()

const Web3 = require('web3')

const fs = require('fs-extra')
const { FeeMarketEIP1559Transaction } = require('@ethereumjs/tx')
const test = require('./test/Test.js')
const Common = require('@ethereumjs/common').default
const { Chain, Hardfork } = require('@ethereumjs/common')
const { createAlchemyWeb3 } = require('@alch/alchemy-web3')
const alchUrl = `https://eth-goerli.alchemyapi.io/v2/${process.env.ALCH_KEY}`
const infuraUrl = `https://goerli.infura.io/v3/${process.env.INFURA_URL}`
const sigUtil = require('eth-sig-util')
var EthUtil = require('ethereumjs-util');
var assert = require('assert');
const TXCost = 2340000
const chainID = 5
const MAX_COMS =30
const MSG = 'Slave Proxy test'//String(new Array(6).fill('Z'));


execc()
async function execc (){
  try {
		await fs.copy('../chat-chain-client/src/contracts/', './contracts/', { overwrite: true })
		console.log('success!')
  	} catch (err) {
    	console.error(err)
  	}
	console.log('Starting')
  const EveeTest = require('./contracts/EveeTest.json')
  const EveeNFT  = require ('./contracts/EveeNFT.json')
  const Recipiant  = require('./contracts/Recipiant.json')
  const RecipiantHashDomainTest  = require('./contracts/RecipiantHashDomainTest.json')
  const RecipiantHashDomain  = require('./contracts/RecipiantHashDomain.json')
  const Evee = require('./contracts/Evee.json')
  
    const provider = infuraUrl
    const web3 = createAlchemyWeb3(alchUrl)
    const networkId = await web3.eth.net.getId()
    console.log('networkId',networkId)
    console.log('Recipiant.networks[networkId].address',Recipiant.networks[networkId].address)
    const recipiantContract = new web3.eth.Contract(Recipiant.abi,Recipiant.networks[networkId].address)

    const eveeContract = new web3.eth.Contract(Evee.abi, Evee.networks[networkId].address)
    const eveeTestContract = new web3.eth.Contract(EveeTest.abi, EveeTest.networks[networkId].address)


    const eveeNFTInstance = new web3.eth.Contract(EveeNFT.abi,EveeNFT.networks[networkId].address)

    const RecipiantHashDomainTestInstance = new web3.eth.Contract(RecipiantHashDomainTest.abi,RecipiantHashDomainTest.networks[networkId].address)
    const RecipiantHashDomainInstance = new web3.eth.Contract(RecipiantHashDomain.abi,RecipiantHashDomain.networks[networkId].address)

    //account[0] = commercial maker
    //account[1] = free user
    //account[2] = proxy master
    //account[3] = proxy slave #1
     const accounts = [await web3.eth.accounts.privateKeyToAccount(process.env.E_WALLET_PKEY_COMMERCIAL_MAKER),await web3.eth.accounts.privateKeyToAccount(process.env.E_WALLET_PKEY_FREE_USER) ,await web3.eth.accounts.privateKeyToAccount(process.env.E_WALLET_PKEY_MASTER_PROXY),await web3.eth.accounts.privateKeyToAccount(process.env.E_WALLET_PKEY_SLAVE_PROXY) ]
     
    console.log('owner           ', accounts[0].address)
    console.log('free user       ', accounts[1].address)
    console.log('proxy master    ', accounts[2].address)
    console.log('proxy slave     ', accounts[3].address)

    const block = await web3.eth.getBlock('pending')
    const baseFee = parseInt(block.baseFeePerGas)
    //set estimation
    const priorityFee = parseInt(await web3.eth.getMaxPriorityFeePerGas())
    const MaxFee = 2 * baseFee + priorityFee
    console.log(
      'baseFee',
      baseFee,
      'priorityFee',
      priorityFee,
      'MaxFee',
      MaxFee
    )

  //beginning of the world
  await test.sendCom_NoTXData(web3,accounts[0],process.env.E_WALLET_PKEY_COMMERCIAL_MAKER,eveeContract,'',TXCost,1,process.env.E_WALLET_ADD_ZERO_COM,recipiantContract._address,MaxFee)
  //await test.sendPaidMsg(web3,accounts[0],process.env.E_WALLET_PKEY_COMMERCIAL_MAKER,recipiantContract,MaxFee)
  
	}

