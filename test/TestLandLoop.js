require('dotenv').config()

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


execc()
async function execc (){
	const Evee = require('./contracts/Evee.json')
  const EveeTest = require('./contracts/EveeTest.json')
  const EveeNFT  = require ('./contracts/EveeNFT.json')
  const Recipiant  = require('./contracts/Recipiant.json')
  const RecipiantHashDomainTest  = require('./contracts/RecipiantHashDomainTest.json')
  const RecipiantHashDomain  = require('./contracts/RecipiantHashDomain.json')  
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
  await test.setWhiteList(web3,eveeContract,accounts[2],process.env.E_WALLET_PKEY_MASTER_PROXY,accounts[3],MaxFee)
  await test.sendCom_NoTXData(web3,accounts[0],process.env.E_WALLET_PKEY_COMMERCIAL_MAKER,eveeContract,'',TXCost,1,accounts[2].address,TestInstance._address,MaxFee)
  //await test.sendPaidMsg(web3,accounts[0],process.env.E_WALLET_PKEY_COMMERCIAL_MAKER,recipiantContract,MaxFee)

  commercials = await test.findCommercials(web3,accounts[2],eveeContract,0,accounts[2].address,recipiantContract._address)
  console.log(commercials)
  let comID = commercials[0]
  
  await sendFreeTest (web3,accounts[1],process.env.E_WALLET_PKEY_FREE_USER, accounts[2],accounts[3],process.env.E_WALLET_PKEY_SLAVE_PROXY,eveeContract,recipiantContract,MaxFee,comID,4)


  
	}

    async function sendFreeTest (web3,free_account,free_accoun_pkey,master_proxy,slave_proxy,slave_proxy_pkey,eveeContract,recipiantContract,MaxFee,comID,num){
    
        // test deadline in future
        const deadline = Date.now() + 100000
    
        const TXtoRecipiant = await recipiantContract.methods
          .land(num).encodeABI()
    
    
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
                verifyingContract: TestContract._address,
              },
              message: {
                txData: TXtoRecipiant,
                sender: free_account.address,
                deadline: deadline,
              },
            })
        result = await sigUtil.signTypedData_v4( Buffer.from(free_accoun_pkey, 'hex'),{data:JSON.parse(msgParams)})
        const signature = result.substring(2)
            const r = '0x' + signature.substring(0, 64)
            const s = '0x' + signature.substring(64, 128)
            const v = parseInt(signature.substring(128, 130), 16)
        const recovered_res = sigUtil.recoverTypedSignature({
                  data: JSON.parse(msgParams),
                  sig: result,
                })
        console.log('free_account.address', free_account.address.toUpperCase())
        console.log('recovered_res       ',recovered_res.toUpperCase())
        assert(recovered_res.toUpperCase() == free_account.address.toUpperCase() , 'signature corruptioin')
        const TX = await eveeContract.methods.freeSendMessege(v,r,s,free_account.address,master_proxy.address,TestContract._address,deadline,TXtoRecipiant,comID).encodeABI()
        await test.sendTXWithPkey (web3,slave_proxy,TX,0,eveeContract,slave_proxy_pkey,MaxFee)
    }
    