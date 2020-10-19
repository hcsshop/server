const { authenticate } = require('@feathersjs/authentication').hooks
const checkPermissions = require('feathers-permissions')

module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [authenticate('jwt'), checkPermissions({ roles: ['admin', 'intuit-oauth'] })],
    update: [authenticate('jwt'), checkPermissions({ roles: ['admin', 'intuit-oauth'] })],
    patch: [authenticate('jwt'), checkPermissions({ roles: ['admin', 'intuit-oauth'] })],
    remove: [authenticate('jwt'), checkPermissions({ roles: ['admin', 'intuit-oauth'] })]
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
