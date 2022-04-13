const server = require('./app')

const getRoutes = () => {
  const sig = require('./routes/sig')
  const commercial = require('./routes/commercial')
  const gasEstimation = require('./routes/gasEstimation')
  server.app.use('/sig', sig)
  server.app.use('/commercial', commercial)
  server.app.use('/gasEstimation', gasEstimation)

  console.log('Routes init successfully')
}

module.exports = getRoutes
