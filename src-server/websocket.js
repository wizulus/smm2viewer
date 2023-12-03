import app from './app.js'

const connections = []

const broadcast = message => {
  const json = JSON.stringify(message)
  for (const connection of connections) {
    try {
      connection.send(json)
    } catch (err) {
      console.warning('Could not broadcast to a client:', err)
    }
  }
}

app.ws.on('connection', ws => {
  connections.push(ws)
  ws.on('close', () => {
    connections.splice(connections.indexOf(ws), 1)
  })
  ws.on('message', json => {
    const message = JSON.parse(json)
    /* TODO: Add logic */
    broadcast(message)
  })
})
