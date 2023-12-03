import RedisMock from './redis-mock.js'
import { getLogger } from './logging.js'

const logger = getLogger('redis')

export const client = new RedisMock()

client.on('reconnecting', () => {
  logger.info('Redis is reconnecting')
})

client.on('end', () => {
  logger.info('Redis is disconnected')
})

client.on('warning', (err) => {
  logger.warn('Redis is warning:', err)
})

const encode = value => {
  if (Buffer.isBuffer(value)) {
    if (value.meta) {
      return `base64:${value.toString('base64')}:${JSON.stringify(value.meta)}`
    } else {
      return `base64:${value.toString('base64')}`
    }
  } else {
    return JSON.stringify(value)
  }
}
const decode = value => {
  if (typeof value !== 'string') throw new Error(`Cannot decode type ${typeof value}.`)
  if (value.startsWith('base64:')) {
    const [, base64, ...meta] = value.split(':')
    const buffer = Buffer.from(base64, 'base64')
    if (meta?.length) {
      buffer.meta = JSON.parse(meta.join(':'))
    }
    return buffer
  } else {
    return JSON.parse(value)
  }
}

/**
 * Gets a value from Redis, JSON parsing it.
 *
 * @param {string} key String key
 * @returns {Promise.<object>}
 */
export const get = key => getMany([key]).then(result => result[0])

/**
 * Gets manu values from Redis, JSON parsing them.
 *
 * @param {string[]} keys String keys
 * @returns {Promise.<object[]>}
 */
export const getMany = async (keys) => {
  if (!keys.length) return []
  return await Promise.all(
    keys.map(key => new Promise((resolve, reject) => {
      client.get(
        key,
        (err, ret) => {
          if (err) {
            reject(err)
          } else {
            try {
              if (ret) {
                resolve(decode(ret))
              } else {
                resolve(null)
              }
            } catch (err) {
              reject(err)
            }
          }
        }
      )
    }))
  )
}

/**
 * Sets a key on Redis
 *
 * @param {string} key String key
 * @param {object} value Object value that will be JSON stringified.
 * @param {object} options Options
 * @param {number} options.expires Expire key after how many milliseconds
 * @param {boolean} options.updateOnly Only set the key if it already exists.
 * @param {boolean} options.insertOnly Only set the key if it does not exist.
 * @param {boolean} options.keepTTL Preserve expiration from previous set().
 *
 * @returns {Promise}
 */
export const set = (key, value, options = {}) => setMany([[key, value]], options).then(x => x[0])

/**
 *
 * @param {object|Map|Array} pairs Key/value pairs to set
 * @param {object} options Options
 * @param {number} options.expires Expire key after how many milliseconds
 * @param {boolean} options.updateOnly Only set the key if it already exists.
 * @param {boolean} options.insertOnly Only set the key if it does not exist.
 * @param {boolean} options.keepTTL Preserve expiration from previous set().
 */
export const setMany = async (pairs, options = {}) => {
  const entries = pairs instanceof Map
    ? pairs.entries
    : Array.isArray(pairs)
      ? pairs
      : Object.entries(pairs)
  if (!entries.length) return
  return await Promise.all(
    entries.map(([key, value]) => new Promise((resolve, reject) => {
      try {
        const args = [key, encode(value)]
        const opts = []
        if (options.expires) opts.push('PX', options.expires.toString())
        if (options.keepTTL) opts.push('KEEPTTL')
        if (options.updateOnly) opts.push('XX')
        if (options.insertOnly) opts.push('NX')

        if (opts.length) args.push(...opts)
        client.set(args, (err, ok) => {
          if (err) {
            reject(err)
          } else {
            resolve(ok)
          }
        })
      } catch (err) {
        reject(err)
      }
    }))
  )
}

export async function deleteMany (keys) {
  await Promise.all(
    keys.map(key => new Promise((resolve, reject) => {
      client.del(key, (err, ok) => {
        if (err) {
          reject(err)
        } else {
          resolve(ok)
        }
      })
    }))
  )
}

export async function delete$ (key) {
  return await deleteMany([key])
}

/**
 * Memoizes a function in redis with a key.
 *
 * @template T
 * @param {string} key
 * @param {()=>T} fn
 * @param {number} ttl
 * @returns {T}
 */
export async function cache (key, fn, ttl = 1000 * 60 * 5) {
  const cached = await get(key)
  if (cached) return cached

  const value = await fn()

  await set(key, value, {
    expires: ttl
  })

  return value
}
