const delay = 1000
const websocketUrl = new URL(`ws${location.protocol.substr(4)}//${location.host}/api`)
const apiUrl = new URL(location.href)
if (process.env.DEV) {
  websocketUrl.port = 4001
  apiUrl.port = 4001
}

class RestError extends Error {}

export class MessageEvent extends CustomEvent {
  constructor (message) {
    super('message', {
      detail: message
    })
  }

  get message () {
    return this.detail
  }
}

export default class Client extends EventTarget {
  constructor () {
    super()
    this._connect = null
  }

  async connect () {
    if (this._connect == null) {
      this._connect = new Promise(resolve => {
        console.log('Constructing')
        const ws = new WebSocket(websocketUrl.toString())
        window.ws = ws
        let connected = false
        const retry = () => resolve(new Promise(resolve => setTimeout(resolve, delay)).then(() => this.connect()))
        const dispatch = evt => this.dispatchEvent(new evt.constructor(evt.type, evt))
        ws.addEventListener('open', evt => {
          console.log('open', evt)
          connected = true
          dispatch(evt)
          resolve(ws)
        })
        ws.addEventListener('close', evt => {
          console.log('close', evt)
          this._connect = null
          dispatch(evt)
          retry()
        })
        ws.addEventListener('message', evt => {
          console.log('message', evt)
          const event = new MessageEvent(JSON.parse(evt.data))
          this.dispatchEvent(event)
        })
        ws.addEventListener('error', evt => {
          console.log('error', evt)
          if (!connected) retry()
          dispatch(evt)
        })
      })
    }
    return await this._connect
  }

  async send (message) {
    const ws = await this.connect()
    ws.send(JSON.stringify(message))
  }

  async request (url, options) {
    const response = await fetch(url, options)
    const body = response.headers.get('Content-Type')?.startsWith('application/json')
      ? await response.json()
      : await response.text()

    if (response.status >= 200 && response.status < 300) {
      return body
    } else {
      const err = new RestError(`${options.method} ${options.url} ${response.status} (${response.message})${response.body ? `: ${response.body}` : ''}`)
      err.response = response
      throw err
    }
  }

  async get (url) {
    return this.request(url, {})
  }

  async patch (url, body) {
    return this.request(url, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : null
    })
  }

  async post (url, body) {
    return this.request(url, {
      method: 'POST',
      body: body ? JSON.stringify(body) : null
    })
  }

  async put (url, body) {
    return this.request(url, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : null
    })
  }

  async delete (url, body) {
    return this.request(url, {
      method: 'DELETE',
      body: body ? JSON.stringify(body) : null
    })
  }
}

export const client = new Client()
