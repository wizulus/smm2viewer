import http from 'http'
import express from 'express'
import morgan from 'morgan'
import { WebSocketServer } from 'ws'
import EventEmitter from 'events'
import chalk from 'chalk'

const app = express()
export default app
app.set('trust proxy', ['loopback', 'linklocal', 'uniquelocal'])
// Do this firts to avoid loggin static requests
app.use(express.static('pwa'))
app.use('/toost', express.static('lib-toost'))

app.use(morgan('combined'))

app.ws = new EventEmitter()
app.listen = (port = process.env.NODE_PORT || (app.settings.env === 'production' ? 80 : 4301)) => new Promise((resolve, reject) => {
  app.server = http.createServer(app)
  app.server.once('error', (err) => {
    if (err.message.includes('EADDRINUSE') && app.settings.env === 'development' && port < 4999) {
      console.warn(err.message)
      resolve(app.listen(port + 1))
    } else {
      reject(err)
    }
  })
  app.server.listen(port, () => {
    app.wss = new WebSocketServer({ server: app.server })
    app.wss.on('connection', (...args) => app.ws.emit('connection', ...args))
    app.wss.on('message', (...args) => app.ws.emit('message', ...args))
    app.wss.on('close', (...args) => app.ws.emit('close', ...args))
    app.wss.on('error', (...args) => app.ws.emit('error', ...args))
    app.server.port = app.server.address().port
    console.log(`Server running at ${chalk.underline(chalk.blueBright(`http://localhost:${app.server.port}`))}`)
    resolve()
  })
})
