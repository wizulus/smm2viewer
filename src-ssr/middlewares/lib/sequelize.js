import sequelizeLib from 'sequelize'
import sqlite3 from 'sqlite3'

export const Sequelize = sequelizeLib.Sequelize
export const Model = sequelizeLib.Model
export const DataTypes = sequelizeLib.DataTypes

function normalizeMethod (fn) {
  const stack = new Error().stack.slice(6)
  return function (...args) {
    if (typeof args[args.length - 1] === 'function') {
      const callback = args[args.length - 1]
      const newCallback = function (err, ...args) {
        if (err) {
          err.stack += '\n    --- SQLITE ---\n' + stack
        }
        callback(err, ...args)
      }
      args[args.length - 1] = newCallback
    }
    return fn.apply(this, args)
  }
}

;['prepare', 'run', 'get', 'all', 'each', 'map'].forEach(f => {
  sqlite3.Database.prototype[f] = normalizeMethod(sqlite3.Database.prototype[f])
})

// export const sequelize = new Sequelize('sqlite::memory:')
export const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: process.env.APP_DATA_PATH || 'app.db',
  logging: false
})
