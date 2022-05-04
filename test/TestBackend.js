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
const alchUrl = `https://polygon-mumbai.g.alchemy.com/v2/${process.env.ALCH_KEY}`
const sigUtil = require('eth-sig-util')
var EthUtil = require('ethereumjs-util');
var assert = require('assert');
const TXCost = 2340000
const chainID = 80001
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
    const web3 = createAlchemyWeb3(alchUrl)
    const networkId = await web3.eth.net.getId()
    console.log('networkId',networkId)
    console.log('Recipiant.networks[networkId].address',Recipiant.networks[networkId].address)
    const recipiantContract = new web3.eth.Contract(Recipiant.abi,Recipiant.networks[networkId].address)

    const eveeContract = new web3.eth.Contract(Evee.abi, Evee.networks[networkId].address)
    
    //account[0] = commercial maker
    //account[1] = free user
    //account[2] = proxy master
    //account[3] = proxy slave #1
    
    const accounts = [await web3.eth.accounts.privateKeyToAccount(process.env.E_WALLET_PKEY_COMMERCIAL_MAKER),await web3.eth.accounts.privateKeyToAccount(process.env.E_WALLET_PKEY_FREE_USER) ,await web3.eth.accounts.privateKeyToAccount(process.env.E_WALLET_PKEY_MASTER_PROXY),await web3.eth.accounts.privateKeyToAccount(process.env.E_WALLET_PKEY_SLAVE_PROXY) ]

    console.log('owner           ', accounts[0].address)
    console.log('free user       ', accounts[1].address)
    console.log('proxy master    ', accounts[2].address)
    console.log('proxy slave     ', accounts[3].address)
    console.log('proxy slave1     ', accounts[3].address)


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
  
  //SendFreeMSGviaBackend (web3,accounts[1],process.env.E_WALLET_PKEY_FREE_USER,eveeContract,recipiantContract,'mumbai0')
  //SendFreeMSGviaBackend (web3,accounts[2],process.env.E_WALLET_PKEY_MASTER_PROXY,eveeContract,recipiantContract,'mumbai1')
  //SendFreeMSGviaBackend (web3,accounts[3],process.env.E_WALLET_PKEY_SLAVE_PROXY,eveeContract,recipiantContract,'mumbai2')
  //SendFreeMSGviaBackend (web3,accounts[0],process.env.E_WALLET_PKEY_COMMERCIAL_MAKER,eveeContract,recipiantContract,'mumbai3')
  const proxys = process.env.E_WALLET_PKEY_SLAVE_PROXYS.split(',')
  console.log('proxys',proxys)
  let i = 1 
  for (proxy of proxys) {
    await new Promise((resolve) => setTimeout(resolve, Math.floor(Math.random() * 10000)));
    account = await web3.eth.accounts.privateKeyToAccount(proxy)
    console.log ('sending as ', account.address)
    let text = 'Stress ' + String(i) + ' ' + account.address
    SendFreeMSGviaBackend (web3,account,proxy,eveeContract,recipiantContract,text)
    i++
  }
  /*text ='2'
  for (proxy of proxys) {
    account = await web3.eth.accounts.privateKeyToAccount(proxy)
    console.log ('sending as ', account)
    SendFreeMSGviaBackend (web3,account,proxy,eveeContract,recipiantContract,text)
    text += '2'

  }*/

  
	}

    async function SendFreeMSGviaBackend (web3,free_account,free_accoun_pkey,eveeContract,TestContract,msg){
    
        // test deadline in future
        const deadline = Date.now() + 100000
    
        const TXtoRecipiant = await TestContract.methods
            .post(msg,0).encodeABI()
        console.log('TestContract',TestContract._address)
        const nonce = await eveeContract.methods.getNonce(masterProxy, await TestContract._address).call({from:free_account.address});
        console.log('none is :', nonce)
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
                  { name: 'nonce', type: 'uint' },
                ],
              },
              //make sure to replace verifyingContract with address of deployed contract
              primaryType: 'land',
              domain: {
                name: 'Evee',
                version: '1',
                chainId: chainID,
                verifyingContract: TestContract._address,
              },
              message: {
                txData: TXtoRecipiant,
                sender: free_account.address,
                deadline: deadline,
                nonce: nonce,
              },
            })
        result = await sigUtil.signTypedData_v4( Buffer.from(free_accoun_pkey, 'hex'),{data:JSON.parse(msgParams)})
        console.log('result', result)
        const signature = result.substring(2)
          const r = '0x' + signature.substring(0, 64)
          const s = '0x' + signature.substring(64, 128)
          const v = parseInt(signature.substring(128, 130), 16)
          console.log('r:', r)
          console.log('s:', s)
          console.log('v:', v)
          console.log('result:', result)
          const recovered_res = sigUtil.recoverTypedSignature({
            data: JSON.parse(msgParams),
            sig: result,
          })
        console.log('free_account.address', free_account.address.toUpperCase())
        console.log('recovered_res       ',recovered_res.toUpperCase())
        assert(recovered_res.toUpperCase() == free_account.address.toUpperCase() , 'signature corruptioin')
        const contract_of_remote = TestContract._address 
        const signer = recovered_res
        const txData = TXtoRecipiant
        const reqMsg = {
            v,
            r,
            s,
            signer,
            contract_of_remote,
            deadline,
            txData,
            nonce,
        }
        console.log(reqMsg)
        try {
            const res = axios.post(`http://localhost:5000/sig`, reqMsg)
            console.log('res: ', res)
        } catch (err) {
            console.log('err:', err)
        }
    }
    