require('dotenv').config()
const axios =require ('axios')
const api = require('./environment')

const Web3 = require('web3')

const fs = require('fs-extra')
const { FeeMarketEIP1559Transaction } = require('@ethereumjs/tx')
const test = require('./Test.js')
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
const masterProxy = '0xf38232721553a3dfa5F7c0E473c6A439CD776038';



execc()
async function execc (){
  const Evee = require('../contracts/Evee.json')
  const EveeTest = require('../contracts/EveeTest.json')
  const EveeNFT  = require ('../contracts/EveeNFT.json')
  const Recipiant  = require('../contracts/Recipiant.json')
  const RecipiantHashDomainTest  = require('../contracts/RecipiantHashDomainTest.json')
  const RecipiantHashDomain  = require('../contracts/RecipiantHashDomain.json')  
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
  const accProx = web3.eth.accounts.privateKeyToAccount(
    process.env.E_WALLET_PKEY
  )
  //await test.setWhiteList(web3,eveeContract,accProx,process.env.E_WALLET_PKEY_MASTER_PROXY,accounts[3],MaxFee)
  //await test.sendCom_NoTXData(web3,accounts[0],process.env.E_WALLET_PKEY_COMMERCIAL_MAKER,eveeContract,'',TXCost,1,accounts[2].address,TestInstance._address,MaxFee)
  //await test.sendPaidMsg(web3,accounts[0],process.env.E_WALLET_PKEY_COMMERCIAL_MAKER,recipiantContract,MaxFee)

  //commercials = await test.findCommercials(web3,accProx,eveeContract,0,accProx.address,recipiantContract._address)
  //console.log(commercials)
  id = 1;
  //testTransferNFT (web3,accounts[0],process.env.E_WALLET_PKEY_COMMERCIAL_MAKER,accounts[1],eveeNFTInstance,id,MaxFee)
  testTransferNFT (web3,accounts[0],process.env.E_WALLET_PKEY_COMMERCIAL_MAKER,accounts[1],eveeNFTInstance,id,MaxFee)

  }

  async function testTransferNFT(web3,owner_account,owner_account_pkey,recipiantAcc,eveeNFTInstance,id,MaxFee){
    /*function transferFrom(
    address _from,
    address _to,
    uint256 _tokenId,
    string calldata _uri*/
    const TX = await eveeNFTInstance.methods
      .transferFrom(owner_account.address, recipiantAcc.address, id, 'https://static9.depositphotos.com/1684360/1193/i/600/depositphotos_11930317-stock-photo-scantron-test-blocks-and-pencil.jpg')
      .encodeABI()
      await test.sendTXWithPkey (web3,owner_account,TX,0,eveeNFTInstance,owner_account_pkey,MaxFee)



}
