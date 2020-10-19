const { authenticate } = require('@feathersjs/authentication').hooks
const checkPermissions = require('feathers-permissions')
const { fastJoin } = require('feathers-hooks-common')

const orderResolvers = {
  joins: {
    customerData: () => async (order, context) => {
      order.customerData = await context.app.service('customers').get(order.customer)
    },

    machinesData: () => async (order, context) => {
      order.machinesData = await context.app.service('machines').find({ query: { $limit: -1, uuid: { $in: order.machines } } })
    }
  }
}

module.exports = {
  before: {
    all: [],
    find: [authenticate('jwt'), checkPermissions({ roles: ['admin', 'find-order'] })],
    get: [authenticate('jwt'), checkPermissions({ roles: ['admin', 'get-order'] })],
    create: [authenticate('jwt'), checkPermissions({ roles: ['admin', 'create-order'] })],
    update: [authenticate('jwt'), checkPermissions({ roles: ['admin', 'update-order'] })],
    patch: [authenticate('jwt'), checkPermissions({ roles: ['admin', 'patch-order'] })],
    remove: [authenticate('jwt'), checkPermissions({ roles: ['admin', 'delete-order'] })]
  },

  after: {
    all: [],
    find: [fastJoin(orderResolvers)],
    get: [fastJoin(orderResolvers)],
    create: [fastJoin(orderResolvers)],
    update: [fastJoin(orderResolvers)],
    patch: [fastJoin(orderResolvers)],
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
