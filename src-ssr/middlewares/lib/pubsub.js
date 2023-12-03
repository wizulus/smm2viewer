import EventEmitter from 'events'
import { getLogger } from './logging.js'
import RedisMock from './mocks/redis-mock.js'
import { init } from './ready.js'

const logger = getLogger('pubsub')

/** @type {redis.RedisClient} */
let rdbPub = null
let usesPub = 0
/** @type {redis.RedisClient} */
let rdbSub = null
let usesSub = 0
const events = new EventEmitter()
let debug = false

init('Pubsub', async () => {
  await Promise.all([
    new Promise((resolve, reject) => acquirePub().on('connect', resolve).on('error', reject)),
    new Promise((resolve, reject) => acquireSub().on('connect', resolve).on('error', reject))
  ])
})

export function acquirePub () {
  rdbPub = new RedisMock()
  usesPub++
  return rdbPub
}

export function releasePub () {
  usesPub--
  if (usesPub === 0 && rdbPub) {
    logger.trace('Disconnecting from Redis for Publish')
    rdbPub.quit()
    rdbPub = null
  }
}
export function acquireSub () {
  if (rdbSub == null) {
    rdbSub = new RedisMock()
    rdbSub.on('message', (channel, message) => {
      const meta = { channel, message }
      logger.trace('MESSAGE %j', meta)
      events.emit(channel, message, meta)
    })
    rdbSub.on('pmessage', (pattern, channel, message, ...args) => {
      const meta = { pattern, channel, message }
      logger.trace('PMESSAGE %j', meta)
      events.emit(pattern, message, meta)
    })
  }
  usesSub++
  return rdbSub
}

export function releaseSub () {
  usesSub--
  if (usesSub === 0 && rdbSub) {
    logger.trace('Disconnecting from Redis for Subscribe')
    rdbSub.quit()
    rdbSub = null
  }
}

export function setDebug (val) {
  debug = val
}

export function publishString (topicName, data) {
  topic(topicName).publishString(data)
}

export function publish (topicName, data) {
  topic(topicName).publish(data)
}

export function subscribeString (topicName, cb) {
  return topic(topicName).subscribeString(cb)
}

export function subscribe (topicName, cb) {
  return topic(topicName).subscribe(cb)
}

export function stream (topicName) {
  return topic(topicName).stream
}

export function topic (name) {
  return new Topic({ name, debug })
}

export class Topic {
  constructor (opts) {
    Object.assign(this, opts)
  }

  withDebug () {
    return new Topic({
      ...this,
      debug: true
    })
  }

  publishString (data) {
    const rdb = acquirePub()
    try {
      logger.trace(`Publish ${this.name}: ${data}`)
      rdb.publish(this.name, data, err => {
        if (err) {
          logger.error(`Publish Error ${this.name}: %s`, err)
          events.emit('error', err)
        }
      })
    } catch (err) {
      events.emit('error', err)
    } finally {
      releasePub()
    }
  }

  publish (data) {
    this.publishString(JSON.stringify(data))
  }

  subscribeString (cb) {
    const rdb = acquireSub()

    logger.trace(`Subscribe ${this.name}`)

    const handler = (data, meta) => {
      logger.trace(`Receive ${this.name}: ${data}`)
      cb(data, meta)
    }

    if (!events.listenerCount(this.name)) {
      // First subscriber to this topic.. Subscribe on Redis
      if (this.name.includes('*') || this.name.includes('?')) {
        logger.trace(`PSubscribe ${this.name} on server`)
        rdb.psubscribe(this.name)
      } else {
        logger.trace(`Subscribe ${this.name} on server`)
        rdb.subscribe(this.name)
      }
    }
    events.on(this.name, handler)

    return new Subscription({
      topic: this,
      onClose: () => {
        logger.trace(`Unsubscribe ${this.name}`)
        events.off(this.name, handler)
        if (!events.listenerCount(this.name)) {
          // Last subscriber on this topic.. Unsubscribe on Redis
          if (this.name.includes('*') || this.name.includes('?')) {
            logger.trace(`PUnsubscribe ${this.name} on server`)
            rdb.punsubscribe(this.name)
          } else {
            logger.trace(`Unsubscribe ${this.name} on server`)
            rdb.unsubscribe(this.name)
          }
        }
        releaseSub()
      }
    })
  }

  subscribe (cb) {
    return this.subscribeString((data, meta) => {
      try {
        cb(JSON.parse(data), meta)
      } catch (err) {
        events.emit('error', err)
      }
    })
  }
}

class Subscription {
  constructor (opts) {
    Object.assign(this, opts)
    this.closed = false
  }

  close () {
    if (!this.closed) {
      if (this.topic.debug) {
        console.debug(`Unsubscribe ${this.topic.name}`)
      }
      this.onClose()
      this.closed = true
    }
  }
}
