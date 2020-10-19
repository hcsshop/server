const { authenticate } = require('@feathersjs/authentication').hooks
const { hashPassword, protect } = require('@feathersjs/authentication-local').hooks
const checkPermissions = require('feathers-permissions')

module.exports = {
  before: {
    all: [],
    find: [authenticate('jwt'), checkPermissions({ roles: ['admin', 'find-user'] })],
    get: [authenticate('jwt'), checkPermissions({ roles: ['admin', 'get-user'] })],
    create: [hashPassword('password'), authenticate('jwt'), checkPermissions({ roles: ['admin', 'create-user'] })],
    update: [hashPassword('password'), authenticate('jwt'), checkPermissions({ roles: ['admin', 'update-user'] })],
    patch: [hashPassword('password'), authenticate('jwt'), checkPermissions({ roles: ['admin', 'patch-user'] })],
    remove: [authenticate('jwt'), checkPermissions({ roles: ['admin', 'delete-user'] })]
  },

  after: {
    all: [
      // Make sure the password field is never sent to the client
      // Always must be the last hook
      protect('password')
    ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
}
