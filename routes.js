const server = require('./app')

const getRoutes = () => {
  const sig = require('./routes/sig')
  const commercial = require('./routes/commercial')
  const gasEstimation = require('./routes/gasEstimation')
  const getEvents = require('./routes/getEvents')
  server.app.use('/sig', sig)
  server.app.use('/commercial', commercial)
  server.app.use('/gasEstimation', gasEstimation)
  server.app.use('/getEvents', getEvents)
  console.log('Routes init successfully')
}

module.exports = getRoutes
