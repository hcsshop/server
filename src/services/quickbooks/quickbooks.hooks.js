const { authenticate } = require('@feathersjs/authentication').hooks
const checkPermissions = require('feathers-permissions')

module.exports = {
  before: {
    all: [],
    find: [authenticate('jwt'), checkPermissions({ roles: ['admin', 'quickbooks-find-customer'] })],
    get: [authenticate('jwt'), checkPermissions({ roles: ['admin', 'quickbooks-get-customer'] })],
    create: [authenticate('jwt'), checkPermissions({ roles: ['admin', 'quickbooks-create-customer'] })],
    update: [authenticate('jwt'), checkPermissions({ roles: ['admin', 'quickbooks-update-customer'] })],
    patch: [authenticate('jwt'), checkPermissions({ roles: ['admin', 'quickbooks-patch-customer'] })],
    remove: [authenticate('jwt'), checkPermissions({ roles: ['admin', 'quickbooks-remove-customer'] })]
  },

  after: {
    all: [],
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
