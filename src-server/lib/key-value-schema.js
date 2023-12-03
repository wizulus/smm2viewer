import { sequelize, DataTypes, Model } from './sequelize.js'

/** @typedef {{key:string, value:string}} KeyValueModel */
/** @augments Model<KeyValueModel> */
export class KeyValue extends Model {}
KeyValue.init({
  key: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  value: DataTypes.STRING
}, {
  sequelize,
  freezeTableName: true,
  indexes: [
    { name: 'key_value_key', unique: true, fields: ['key'] }
  ]
})
