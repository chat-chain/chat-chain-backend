require('dotenv').config()
const Web3 = require('web3')
const pinataSDK = require('@pinata/sdk')
const pinata = pinataSDK(
  process.env.PINATA_PUBLIC_KEY,
  process.env.PINATA_PRIVATE_KEY
)
const axios = require('axios')
const alchUrl =
`https://polygon-mumbai.g.alchemy.com/v2/${process.env.ALCH_KEY}`
const { createAlchemyWeb3 } = require('@alch/alchemy-web3')
const scripty = async () => {
  const jsonToSend = {
    description: 'JSON REST API',
    external_url: 'https://www.google.com/',
    image:
      'https://gateway.pinata.cloud/ipfs/QmVyKSymq6abFsSeRJ6n7Kkjkju9XW1Mqj237ZaDtv2e2W/28102009004.jpg',
    name: 'JSON API PIC',
  }
  // const url = `https://gateway.pinata.cloud/ipfs/Qmbm8Yf9Erb19siX5iPfaTLkRk1TNcGKXPes2QMG1rugo2`
  const headers = {
    Authorization: process.env.PINATA_JWT,
  }
  const urlgetItem =
    'https://gateway.pinata.cloud/ipfs/QmUHeDovuppZGU3yMccWpcCZ3GbcfiYGmCTMSUUn7XsqLY'
  //   export const pinFileToIPFS = (publicKey, privateKey) => {}
  const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`
  //   try {
  //     const response = await axios.get(url, {
  //       headers,
  //     })
  //     console.log(response.data)
  //   } catch (err) {
  //     console.log('ERR', err)
  //   }

  //   try {
  //     const response = await axios.post(url, jsonToSend, {
  //       headers,
  //     })
  //     console.log(response.data)
  //   } catch (err) {
  //     console.log('ERR', err)
  //   }
  const body = {
    message: 'Pinatas are awesome',
  }
  const options = {
    pinataMetadata: {
      name: 'some name',
      keyvalues: {
        customKey: 'customValue',
        customKey2: 'customValue2',
      },
    },
  }

  //   try {
  //     const result = await pinata.pinJSONToIPFS(body, options)
  //     console.log(result)
  //   } catch (err) {
  //     console.log(err)
  //   }
  const filters = {
    hashContains: 'QmUHeDovuppZGU3yMccWpcCZ3GbcfiYGmCTMSUUn7XsqLY',
  }
  //   const res = await pinata.pinList(filters)
  //   console.log(res)
  //   console.log(res.rows[0])
  //   console.log(res.rows[0].metadata)
  // try {
  //   const response = await axios.get(`https://gateway.pinata.cloud/ipfs/QmUHeDovuppZGU3yMccWpcCZ3GbcfiYGmCTMSUUn7XsqLY`, {
  //     headers,
  //   })
  //   console.log(response.data)
  // } catch (err) {
  //   console.log('ERR', err)
  // }
}
const scriptyWeb3 = async () => {
  const web3 = createAlchemyWeb3(alchUrl)
  const provider =
  `https://polygon-mumbai.g.alchemy.com/v2/${process.env.ALCH_KEY}`
  web3.setWriteProvider(provider)
  const gas = await web3.eth.getMaxPriorityFeePerGas()
  console.log(gas)
  console.log(parseInt(web3.utils.hexToNumberString(gas)))
}
module.exports = scriptyWeb3
