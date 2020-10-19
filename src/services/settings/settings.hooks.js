/* eslint-disable key-spacing, no-multi-spaces, array-bracket-spacing */
const { authenticate } = require('@feathersjs/authentication').hooks
const checkPermissions = require('feathers-permissions')

module.exports = {
  before: {
    all:    [authenticate('jwt')],
    find:   [checkPermissions({ roles: ['admin', 'find-settings'  ] })],
    get:    [checkPermissions({ roles: ['admin', 'get-settings'   ] })],
    create: [checkPermissions({ roles: ['admin', 'create-settings'] })],
    update: [checkPermissions({ roles: ['admin', 'update-settings'] })],
    patch:  [checkPermissions({ roles: ['admin', 'patch-settings' ] })],
    remove: [checkPermissions({ roles: ['admin', 'remove-settings'] })]
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
