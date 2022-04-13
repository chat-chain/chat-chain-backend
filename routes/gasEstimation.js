const express = require('express')
const router = express.Router()
const gasEstimation = require('../controllers/gasEstimation')
router.get('/', gasEstimation.getGasEstimation, (req, res) => {
  res.status(200).json(res.result)
})

module.exports = router
