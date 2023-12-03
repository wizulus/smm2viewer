import EventEmitter from 'events'
import micromatch from 'micromatch'
import { KeyValue } from './key-value-schema.js'
import { getLogger } from './logging.js'

const logger = getLogger('redis-mock')

/** @type {Record<string, Set<RedisMock>>} */
const channels = {}

/**
 * @class
 * @augments import('redis').RedisClient
 */
export default class RedisMock extends EventEmitter {
  constructor () {
    super()
    setImmediate(() => {
      this.emit('connect')
      this.emit('ready')
    })
  }

  async get (key, cb) {
    try {
      const record = await KeyValue.findOne({
        where: { key }
      })
      if (record && (!record.expires || record.expires > Date.now())) {
        cb(null, record?.value)
      } else {
        cb(null, null)
      }
    } catch (err) {
      cb(err)
    }
  }

  async set (args, cb) {
    const nargs = args.slice(0)
    const key = nargs.shift()
    const value = nargs.shift()
    const opts = new Set(nargs)
    const existing = await KeyValue.findOne({ where: { key } })
    let expires = null
    if (opts.has('XX') && !existing) {
      // Update only and it doesn't exist
      logger.trace(`set ${args.join(' ')} failed because it doesn't exist.`)
      return cb(null, false)
    }
    if (opts.has('NX') && existing) {
      // Insert only and it already exists
      logger.trace(`set ${args.join(' ')} failed because it already exists.`)
      return cb(null, false)
    }
    if (opts.has('PX')) {
      expires = Date.now() + parseInt(opts[opts.indexOf('PX') + 1])
    }
    // PX sets an expiration, but this mock shouldn't live that long.
    logger.trace(`set ${args.join(' ')}`)
    await KeyValue.upsert({ key, value, expires })
    cb(null, true)
  }

  async del (key, cb) {
    logger.trace(`del ${key}`)
    try {
      const result = !!(await KeyValue.destroy({ where: { key } }))
      return cb(null, result)
    } catch (err) {
      cb(err)
    }
  }

  subscribe (name) {
    if (!channels[name]) channels[name] = new Set()
    channels[name].add(this)
  }

  psubscribe (name) {
    if (!channels[name]) channels[name] = new Set()
    channels[name].add(this)
  }

  unsubscribe (name) {
    if (channels[name]) {
      channels[name].delete(this)
      if (!channels[name].size) delete channels[name]
    }
  }

  punsubscribe (name) {
    if (channels[name]) {
      channels[name].delete(this)
      if (!channels[name].size) delete channels[name]
    }
  }

  publish (name, message, cb) {
    for (const key in channels) {
      if (micromatch.isMatch(name, key)) {
        for (const client of channels[key]) {
          client.emit('message', name, message)
          client.emit('pmessage', key, name, message)
        }
      }
    }
  }
}
