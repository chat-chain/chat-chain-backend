const cluster = require('cluster')
const os = require('os')
const routes = require('./routes')
const cors = require('cors')
const express = require('express')
const scripts = require('./scripts')
const fs = require('fs')
const app = express() //init express app
const pocess = require('process')
exports.app = app
app.use(express.json()) // Make sure it comes back as json
app.use(express.urlencoded({ extended: false }))
// app.use(cors())
app.use(
  cors({
    origin: ['http://localhost:3000', 'https://rest.chat-chain.com'],
  })
)

//ganache client running on port 7545

const start = async () => {
  // scripts()

  await unlockSemAttemt('indexing.lock')
  const dict = { ComsArray: [] }
  fs.writeFile(
    'MultiProcComs.json',
    JSON.stringify(dict),
    function (err, result) {
      if (err) console.log('error', err)
    }
  )
  fs.writeFile('MultiProcProxysIndex.txt', '', function (err, result) {
    if (err) console.log('error', err)
  })
  const proxys = process.env.E_WALLET_PKEY_SLAVE_PROXYS.split(',')
  for (proxy in proxys) {
    console.log(proxys[proxy], 'proxy')
    await AddIndex(proxys[proxy] + '-' + '0')
  }

  console.log(
    '-------------------------------------------Current gid: ' + process.pid
  )

  routes()

  const PORT = process.env.PORT || 5000 //set port
  app.listen(PORT, () => console.log(`Server listening on port ${PORT}`)) //start server

  app.get('/', (req, res) => {
    console.log('INTERCEPTED ROOT URL')
    res.status(200).send(`<h7>${req.hostname}</h7>`)
  })
  //listen to port and get txdataToRelay and signatureToRelay
}
const lockSem = async (semFile) => {
  console.log('attemting semaphore lock', process.pid)
  let locked = false
  while (!locked) {
    try {
      let f = await fs.promises.open(semFile, 'wx')
      f.close()
      console.log('lock obtained', semFile)
      locked = true
    } catch (error) {
      console.log(error)
      console.log(
        'failed to lock... trying again in ',
        process.pid,
        ' second',
        semFile
      )
      locked = false
      await new Promise((resolve) => setTimeout(resolve, process.pid / 4))
    }
  }
}

const unlockSem = async (semFile) => {
  await fs.unlink(semFile, (err, jsonString) => {
    if (err) {
      console.log(err)
      console.log('lock was not deleted!', semFile)
      throw new Error('LOCK WAS NOT DELETED')
    }
    console.log('lock was deleted :)', semFile)
  })
}

const unlockSemAttemt = async (semFile) => {
  await fs.unlink(semFile, (err, jsonString) => {
    if (err) {
      console.log('lock not exist', semFile)
    } else console.log('lock was deleted', semFile)
  })
}

const AddIndex = async (stringg) => {
  await fs.promises.appendFile('MultiProcProxysIndex.txt', stringg + ' ')
}

start()
