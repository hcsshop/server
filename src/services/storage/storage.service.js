// Initializes the `settings` service on path `/settings`
const { Storage } = require('./storage.class')
const createModel = require('../../models/storage.model')
const hooks = require('./storage.hooks')

module.exports = function (app) {
  const options = {
    id: 'uuid',
    Model: createModel(app),
    storage: app.get('storage')
  }

  // Initialize our service with any options it requires
  app.use('/storage', new Storage(options, app))

  // Get our initialized service so that we can register hooks
  const service = app.service('storage')

  service.hooks(hooks)
}
