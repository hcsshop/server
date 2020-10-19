const { authenticate } = require('@feathersjs/authentication').hooks
const { hashPassword, protect } = require('@feathersjs/authentication-local').hooks
const checkPermissions = require('feathers-permissions')

const $search = async hook => {
  if (hook.params.query.$search) {
    var search = hook.params.query.$search
    var regEx = new RegExp('.*' + search + '.*', 'i')
    delete hook.params.query.$search
    hook.params.query.$or = [
      { 'profile.name.first': regEx },
      { 'profile.name.middle': regEx },
      { 'profile.name.last': regEx },
      { 'profile.name.display': regEx },
      // { 'profile.address.billing': regEx },
      // { 'profile.address.physical': regEx }
    ]
  }
}

module.exports = {
  before: {
    all: [],
    find: [
      authenticate('jwt'),
      checkPermissions({ roles: ['admin', 'find-customer'] }),
      $search
    ],
    get: [authenticate('jwt'), checkPermissions({ roles: ['admin', 'get-customer'] })],
    create: [hashPassword('password'), authenticate('jwt'), checkPermissions({ roles: ['admin', 'create-customer'] })],
    update: [hashPassword('password'), authenticate('jwt'), checkPermissions({ roles: ['admin', 'update-customer'] })],
    patch: [hashPassword('password'), authenticate('jwt'), checkPermissions({ roles: ['admin', 'patch-customer'] })],
    remove: [authenticate('jwt'), checkPermissions({ roles: ['admin', 'delete-customer'] })]
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
