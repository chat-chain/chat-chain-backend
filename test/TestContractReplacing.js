require('dotenv').config()
const Web3 = require('web3')
const Evee = require('../contracts/Evee.json')
const EveeTest = require('../contracts/EveeTest.json')
const EveeNFT  = require ('../contracts/EveeNFT.json')
const Recipiant  = require('../contracts/Recipiant.json')
const RecipiantHashDomainTest  = require('../contracts/RecipiantHashDomainTest.json')
const RecipiantHashDomain  = require('../contracts/RecipiantHashDomain.json')
const { FeeMarketEIP1559Transaction } = require('@ethereumjs/tx')
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


doMain()
async function doMain (){
    console.log('Starting')
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
  //await sendCom_NoTXData(web3,accounts[0],process.env.E_WALLET_PKEY_COMMERCIAL_MAKER,eveeContract,'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/MetaMask_Fox.svg/1200px-MetaMask_Fox.svg.png',TXCost,process.env.E_WALLET_ADD_ZERO_COM,recipiantContract._address,MaxFee)
  //await sendPaidMsg(web3,accounts[0],process.env.E_WALLET_PKEY_COMMERCIAL_MAKER,recipiantContract,MaxFee)
  //
  //test replacing hash sig
  /*
  const newHashContractAddress = RecipiantHashDomainTestInstance._address
  const newHashContractAddress = RecipiantHashDomainInstance._address
  console.log('addddrrreeessssss ',newHashContractAddress)
  await replaceRecipiantDomainHash(web3,accounts[0],process.env.E_WALLET_PKEY_COMMERCIAL_MAKER,recipiantContract,newHashContractAddress,MaxFee)
  */
  //test with acount 1 later
  //await replaceRecipiantEvee(web3,accounts[0],process.env.E_WALLET_PKEY_COMMERCIAL_MAKER,recipiantContract,eveeContract._address,eveeTestContract._address,MaxFee)
  await setWhiteList(web3,eveeContract,accounts[2],process.env.E_WALLET_PKEY_MASTER_PROXY,accounts[3],MaxFee)
  await sendCom_NoTXData(web3,accounts[0],process.env.E_WALLET_PKEY_COMMERCIAL_MAKER,eveeContract,'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/MetaMask_Fox.svg/1200px-MetaMask_Fox.svg.png',TXCost,accounts[2].address,recipiantContract._address,MaxFee)
  commercials = await findCommercials(web3,accounts[2],eveeContract,0,accounts[2].address,recipiantContract._address)
    let coms_after = 0
    commercials.forEach(element => {if (element > 0) coms_after ++; })
    let comID = commercials[0]
  await sendFreeMsg (web3,accounts[1],process.env.E_WALLET_PKEY_FREE_USER, accounts[2],accounts[3],process.env.E_WALLET_PKEY_SLAVE_PROXY,eveeContract,recipiantContract,MaxFee,MSG,0,comID)


}



async function replaceRecipiantDomainHash(web3,owner,owner_pkey,recipiantContract,newHashContractAddress,MaxFee){
  const TX = await recipiantContract.methods
        .changedomainHashAdd(newHashContractAddress)
        .encodeABI()
  await sendTXWithPkey (web3,owner,TX,0,recipiantContract,owner_pkey,MaxFee)
}

async function replaceRecipiantEvee(web3,owner,owner_pkey,recipiantContract,newEveeAddress,oldEveeAddress,MaxFee){
  var TX = await recipiantContract.methods
        .whiteListEvee(newEveeAddress)
        .encodeABI()
  await sendTXWithPkey (web3,owner,TX,0,recipiantContract,owner_pkey,MaxFee)
  TX = await recipiantContract.methods
        .blackListEvee(oldEveeAddress)
        .encodeABI()
  await sendTXWithPkey (web3,owner,TX,0,recipiantContract,owner_pkey,MaxFee)
}

















//---------------------------- DELETE ONCE YOU CAN IMPORT FROM TEST.JS -----------------------------------------------\\
async function getComMsg(c,_from,_to, _filter){
  console.log('1')
   return await c.getPastEvents(
       'post_msg',
      {
        filter: {}, // use prev : x to see all x's replies
        fromBlock: 0,
        toBlock: 'latest',
      },
      (error, events) => {
        console.log('posts: ', events)
        console.log('error: ', error)
      }
    )

}

async function sendPaidMsg (web3,com_account,com_account_pkey,recipiantContract,MaxFee){
    
    const TX = await recipiantContract.methods
      .post('PaidTest',0)
      .encodeABI()
      await sendTXWithPkey (web3,com_account,TX,0,recipiantContract,com_account_pkey,MaxFee)



}

async function sendCom_NoTXData(web3,com_account,com_account_pkey,eveeContract,uri,amount,attach_from,attach_to,MaxFee){
    
    const TX = await eveeContract.methods
      .acceptComercial(attach_from, attach_to, uri)
      .encodeABI()
      await sendTXWithPkey (web3,com_account,TX,amount,eveeContract,com_account_pkey,MaxFee)



}


async function setWhiteList(web3,eveeContract,master_proxy,master_proxy_pkey,slave_proxy,MaxFee){
  const isWhiteListed = await eveeContract.methods.inWhiteList(master_proxy.address).call({from:slave_proxy.address})
  console.log('isWhiteListed',isWhiteListed)
  if (! isWhiteListed)
  {
      console.log('adding ot whitelist')
      const TX = await eveeContract.methods
      .addToWhiteList(slave_proxy.address)
      .encodeABI()
      await sendTXWithPkey (web3,master_proxy,TX,0,eveeContract,master_proxy_pkey,MaxFee)
  }
  else console.log('already white listed')

}


async function sendFreeMsg (web3,free_account,free_accoun_pkey,master_proxy,slave_proxy,slave_proxy_pkey,eveeContract,recipiantContract,MaxFee,msg,replyTo,comID){
    
    // test deadline in future
    const deadline = Date.now() + 100000

    const TXtoRecipiant = await recipiantContract.methods
      .post(msg,replyTo).encodeABI()


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
            verifyingContract: recipiantContract._address,
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
    const TX = await eveeContract.methods.freeSendMessege(v,r,s,free_account.address,master_proxy.address,recipiantContract._address,deadline,TXtoRecipiant,comID).encodeABI()
    await sendTXWithPkey (web3,slave_proxy,TX,0,eveeContract,slave_proxy_pkey,MaxFee)
}




async function findCommercials (web3,masterProxyAccount,eveeContract,amount,attach_from,attach_to){
    return await eveeContract.methods
      .findCommercialArr(
        attach_from,
        attach_to,
        amount,
        MAX_COMS
      )
      .call({ from: attach_from })
}



async function sendTXWithPkey (web3,account,abi,amount,to,pkey,MaxFee){
    const transaction = {
      from: account.address,
      maxFeePerGas: await web3.utils.toHex(MaxFee),
      maxPriorityFeePerGas: await web3.utils.toHex(MaxFee),
      to: to._address,
      data: abi,
      gasLimit: await web3.utils.toHex(6000000),
      value : amount,
    }

    const txCount = await web3.eth.getTransactionCount(
      account.address,
      'pending'
    )
    const common = new Common({
      chain: Chain.Goerli,
      hardfork: Hardfork.London,
    })
    const tx = FeeMarketEIP1559Transaction.fromTxData(
      { ...transaction, nonce: await web3.utils.toHex(txCount) },
      { common }
    )
    const singedTx = tx.sign(Buffer.from(pkey, 'hex'))
    const serializedTx = singedTx.serialize().toString('hex')
    console.log('preparing to send')
    const receipt = await web3.eth.sendSignedTransaction(
      '0x' + serializedTx,
      (err, hash) => {
        if (err) {
          console.log(err)
          return
        }
        console.log('sending tx, hash : ' + hash)
      }
    )
}