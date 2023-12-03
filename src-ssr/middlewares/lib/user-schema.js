import { sequelize, DataTypes, Model } from './sequelize.js'
import { v1 } from 'uuid'

/** @typedef {'admin'|'user'} Role */
/** @typedef {{id:string, username:string, role:Role}} UserModel */
/** @augments Model<UserModel> */
export class User extends Model {}
User.init({
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    defaultValue: v1
  },
  username: DataTypes.STRING,
  role: DataTypes.STRING
}, {
  sequelize,
  freezeTableName: true,
  indexes: [
    { name: 'user_id', unique: true, fields: ['id'] },
    { name: 'user_username', unique: true, fields: ['username'] }
  ]
})

/** @typedef {'basic'} AuthMethod */
export class Auth extends Model {}
Auth.init({
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    defaultValue: v1
  },
  authMethod: {
    type: DataTypes.STRING,
    defaultValue: 'basic'
  },
  value: DataTypes.STRING
}, {
  sequelize,
  freezeTableName: true,
  indexes: [
    { name: 'auth_id', unique: true, fields: ['id'] }
  ]
})
