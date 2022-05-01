require('dotenv').config()
const { createAlchemyWeb3 } = require('@alch/alchemy-web3')
exports.getMaxPriorityFeePerGas = async (req, res, next) => {
  const web3 = createAlchemyWeb3(
    `https://polygon-mumbai.g.alchemy.com/v2/${process.env.ALCH_KEY}`
  )
  const provider = `https://polygon-mumbai.g.alchemy.com/v2/${process.env.ALCH_KEY}`
  web3.setWriteProvider(provider)
  const gas = await web3.eth.getMaxPriorityFeePerGas()
  console.log(gas)
  const gasDecimal = parseInt(web3.utils.hexToNumberString(gas))
  console.log(gasDecimal)
  res.result = gasDecimal
  next()
}
