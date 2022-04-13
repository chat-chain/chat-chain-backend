const express = require('express')
const router = express.Router()
const commercial = require('../controllers/commercial')
router.get('/getMaxPriorityFeePerGas', commercial.getMaxPriorityFeePerGas, (req, res) => {
  res.status(200).json(res.result)
})

module.exports = router
