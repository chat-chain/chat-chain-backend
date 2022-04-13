const express = require('express')
const router = express.Router()
const sig = require('../controllers/sig')

router.post('/', sig.getAccountsRecover, (req, res) => {
  res.status(200).json({ messsage: 'great job' })
})

module.exports = router
