// Initializes the `settings` service on path `/settings`
const { Settings } = require('./settings.class')
const createModel = require('../../models/settings.model')
const hooks = require('./settings.hooks')

module.exports = function (app) {
  const options = {
    id: 'key',
    Model: createModel(app),
    whitelist: ['$regex', '$options']
  }

  // Initialize our service with any options it requires
  app.use('/settings', new Settings(options, app))

  // Get our initialized service so that we can register hooks
  const service = app.service('settings')

  service.hooks(hooks)
}
