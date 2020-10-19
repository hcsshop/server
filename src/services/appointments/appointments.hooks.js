const { authenticate } = require('@feathersjs/authentication').hooks
const checkPermissions = require('feathers-permissions')
const { fastJoin } = require('feathers-hooks-common')

const appointmentResolvers = {
  joins: {
    customerData: () => async (appointment, context) => {
      appointment.customerData = await context.app.service('customers').get(appointment.customer)
    }
  }
}

module.exports = {
  before: {
    all: [],
    find: [authenticate('jwt'), checkPermissions({ roles: ['admin', 'find-appointments'] })],
    get: [authenticate('jwt'), checkPermissions({ roles: ['admin', 'get-appointments'] })],
    create: [authenticate('jwt'), checkPermissions({ roles: ['admin', 'create-appointments'] })],
    update: [authenticate('jwt'), checkPermissions({ roles: ['admin', 'update-appointments'] })],
    patch: [authenticate('jwt'), checkPermissions({ roles: ['admin', 'patch-appointments'] })],
    remove: [authenticate('jwt'), checkPermissions({ roles: ['admin', 'delete-appointments'] })]
  },

  after: {
    all: [],
    find: [fastJoin(appointmentResolvers)],
    get: [fastJoin(appointmentResolvers)],
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
