const { authenticate } = require('@feathersjs/authentication').hooks
const checkPermissions = require('feathers-permissions')

const setS3ACL = hook => { hook.params.s3 = { ACL: 'public-read' } } // TODO: More like TODon't. This is really only necessary for rich-markdown-editor uploading

module.exports = {
  before: {
    all: [authenticate('jwt')],
    find: [checkPermissions({ roles: ['admin', 'find-storage'] })],
    get: [checkPermissions({ roles: ['admin', 'get-storage'] })],
    create: [checkPermissions({ roles: ['admin', 'create-storage'] }), setS3ACL],
    update: [checkPermissions({ roles: ['admin', 'update-storage'] })],
    patch: [checkPermissions({ roles: ['admin', 'patch-storage'] })],
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
};
