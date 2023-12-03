import express from 'express'
import { getLogger } from './logging.js'
import WebError, { internalServerError } from './web-error.js'

const logger = getLogger('rest-router')

/** @typedef { import("express").IRouter } IRouter */
/** @typedef { import("express").Application } Application */
/** @typedef { import("express").RequestHandler } RequestHandler */
/** @typedef { import("http").ServerResponse } ServerResponse */
/** @typedef { import("http").IncomingHttpHeaders } IncomingHttpHeaders */

/**
 * @typedef RestRequest
 * @property {Object} body Decoded JSON body
 * @property {IncomingHttpHeaders} headers Request headers
 * @property {string} ip Client IP Address
 * @property {string} locale Locale in the form of 'en-US' as informed by the Accept-Language header, or overridden by route parameters, or query strings. Defaults to en-US.
 * @property {string} language The language component of locale in the form of 'en'.
 * @property {string} country The country component of locale in the form of 'US'.
 * @property {string} referer Referer URL as a string.
 * @property {string} origin Origin URL as a string.
 */

/**
 * @callback Handler
 * @param {RestRequest} req
 * @param {ServerResponse} res
 * @returns {Promise<object|WebError>}
 */

/**
 * @callback RegisterHandler
 * @param {string} path
 * @param {Handler} handler1
 * @param {Handler} handler2
 * @param {...Handler} handler4
 */
const BaseRouter = express.Router

const isDev = process.stdout.isTTY

/**
 * Creates an express router that accepts async handlers,
 * and treats returned objects as JSON responses.
 *
 * @property {RegisterHandler} get Handle GET requests
 * @property {RegisterHandler} post Handle POST requests
 * @property {RegisterHandler} patch Handle PATCH requests
 * @property {RegisterHandler} put Handle PUT requests
 * @property {RegisterHandler} delete Handle DELETE requests
 */
export default class RestRouter extends BaseRouter {
  constructor () {
    super()
    /**
     * @returns {RegisterHandler}
     */
    const makeHandler = verb => {
      const original = this[verb]
      return (path, ...args) => {
        const newArgs = args.map((fn, i) => {
          if (typeof fn === 'function') {
            return async (req, res, next) => {
              const handle = async () => {
                // This is the beginning of a request
                try {
                  let nextCalled = false
                  const myNext = (...args) => {
                    nextCalled = true
                    next(...args)
                  }
                  const ret = await fn(req, res, myNext)
                  await Promise.resolve(res.slow)
                  if (nextCalled) return
                  if (ret instanceof WebError) throw ret
                  if (ret !== undefined) {
                    try {
                      if (Buffer.isBuffer(ret)) {
                        res.set('Content-Type', ret.meta?.contentType ?? 'application/octet-stream')
                        if (ret.meta?.cacheControl) {
                          res.set('Cache-Control', ret.meta?.cacheControl)
                        }
                        if (ret.meta?.lastModified) {
                          res.set('Last-Modified', new Date(ret.meta.lastModified).toGMTString())
                        }
                        res.send(ret)
                      } else {
                        // Send Server-Timing
                        res.set('Content-Type', 'application/json; charset=utf-8')
                        res.send(
                          Buffer.from(
                            isDev
                              ? JSON.stringify(ret, null, 2)
                              : JSON.stringify(ret)
                          )
                        )
                      }
                    } catch (err) {
                      logger.error(`Unable to respond with JSON: ${verb} ${path}:`, err)
                      throw internalServerError.withBody('Unable to encode response.')
                    }
                  } else if (!res.headersSent) {
                    throw new Error('Handler returned `undefined` without handling response.')
                  }
                } catch (err) {
                  err.definitelyHandled = true
                  logger.error(`Error handling ${path}:`, err.stack)
                  await Promise.resolve(res.slow)
                  try {
                    if (err instanceof WebError) {
                      res.statusCode = err.statusCode
                      res.statusMessage = err.message
                      if (err.body) {
                        res.send(err.body)
                      } else {
                        res.end()
                      }
                    } else {
                      res.status(500).send(err.message || 'Unknown error')
                    }
                  } catch (err) {
                    logger.warn(`Unable to respond with error from ${verb} ${path}:`, err)
                  }
                }
              }
              // Only profile the last function
              try {
                await handle()
              } catch (err) {
                logger.error('Error executing handler:', err)
              }
              // Somehow if an error occurs in the handler, we'll get here, but when the function exits, it's treated as an unhandled promise rejection.
            }
          } else {
            return fn
          }
        })
        return original.call(this, path, ...newArgs)
      }
    }

    this.get = makeHandler('get')
    this.put = makeHandler('put')
    this.post = makeHandler('post')
    this.patch = makeHandler('patch')
    this.delete = makeHandler('delete')
    this.all = makeHandler('all')
  }
}

/**
 * Makes a handler always take a minimum time to respond so that hackers cannot infer information by how long a request takes.
 *
 * @param {number} ms Amount of time to wait before responding (Default: 1000)
 */
export function slow (ms = 1000) {
  return (req, res, next) => {
    res.slow = new Promise(resolve => setTimeout(resolve, ms))
    next()
  }
}
