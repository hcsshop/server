const { authenticate } = require('@feathersjs/authentication').hooks
const checkPermissions = require('feathers-permissions')

const $search = async hook => {
  if (hook.params.query.$search) {
    var search = hook.params.query.$search
    var regEx = new RegExp('.*' + search + '.*', 'i')
    delete hook.params.query.$search
    hook.params.query.$or = [
      { uuid: regEx },
      { manufacturer: regEx },
      { model: regEx },
      { serial: regEx }
    ]
  }
}

module.exports = {
  before: {
    all: [],
    find: [authenticate('jwt'), checkPermissions({ roles: ['admin', 'find-machine'] }), $search],
    get: [authenticate('jwt'), checkPermissions({ roles: ['admin', 'get-machine'] })],
    create: [authenticate('jwt'), checkPermissions({ roles: ['admin', 'create-machine'] })],
    update: [authenticate('jwt'), checkPermissions({ roles: ['admin', 'update-machine'] })],
    patch: [authenticate('jwt'), checkPermissions({ roles: ['admin', 'patch-machine'] })],
    remove: [authenticate('jwt'), checkPermissions({ roles: ['admin', 'delete-machine'] })]
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
