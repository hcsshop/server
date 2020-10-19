const { v4: uuidv4 } = require('uuid')

const permissions = [
  '*',
  'super-admin', 'admin', 'manager', 'finance', 'technician', 'user',
  'create-user', 'find-user', 'get-user', 'update-user', 'patch-user', 'delete-user',
  'create-settings', 'find-settings', 'get-settings', 'update-settings', 'patch-settings', 'delete-settings',
  'intuit-oauth', 'quickbooks-create-customer', 'quickbooks-find-customer', 'quickbooks-get-customer',
  'quickbooks-update-customer', 'quickbooks-patch-customer', 'quickbooks-remove-customer',
  'create-customer', 'find-customer', 'get-customer', 'update-customer', 'patch-customer', 'delete-customer',
  'create-order', 'find-order', 'get-order', 'update-order', 'patch-order', 'delete-order',
  'create-machine', 'find-machine', 'get-machine', 'update-machine', 'patch-machine', 'delete-machine',
  'create-storage', 'find-storage', 'get-storage', 'update-storage', 'patch-storage', 'delete-storage'
]

module.exports = function (app) {
  const modelName = 'users'
  const mongooseClient = app.get('mongooseClient')

  const schema = new mongooseClient.Schema({
    uuid: { type: String, index: true, unique: true, default: uuidv4 },
    email: { type: String, trim: true, unique: true, lowercase: true, required: true },

    password: String,
    googleId: String,
    facebookId: String,
    twitterId: String,
    githubId: String,

    permissions: {
      type: [String],
      validate: {
        message: 'Invalid permission type specified',
        validator: permission => {
          return permission.every(perm => permissions.includes(perm))
        }
      }
    },

    loginControl: {
      loginAllowed: { type: Boolean, default: true },
      lastLogin: { type: Date, default: Date.now },
      lastLoginFailure: Date,
      failuresSinceLastLogin: Date
    },

    profile: {
      name: { type: String, default: 'User' },
      photo: String
    }
  }, {
    timestamps: true
  })

  // This is necessary to avoid model compilation errors in watch mode
  // see https://mongoosejs.com/docs/api/connection.html#connection_Connection-deleteModel
  if (mongooseClient.modelNames().includes(modelName)) mongooseClient.deleteModel(modelName)
  return mongooseClient.model(modelName, schema)
}
