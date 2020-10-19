/* eslint-disable key-spacing, no-multi-spaces, array-bracket-spacing */
const { authenticate } = require('@feathersjs/authentication').hooks
const checkPermissions = require('feathers-permissions')

module.exports = {
  before: {
    all:    [authenticate('jwt')],
    find:   [checkPermissions({ roles: ['admin', 'find-storage'  ] })],
    get:    [checkPermissions({ roles: ['admin', 'get-storage'   ] })],
    create: [checkPermissions({ roles: ['admin', 'create-storage'] })],
    update: [checkPermissions({ roles: ['admin', 'update-storage'] })],
    patch:  [checkPermissions({ roles: ['admin', 'patch-storage' ] })],
    remove: [checkPermissions({ roles: ['admin', 'remove-storage'] })]
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
