const express = require('express')
const router = express.Router()
const getEvents = require('../controllers/getEvents')
router.post('/', getEvents.getEvents, (req, res) => {
  res.status(200).json(res.result)
})

module.exports = router
