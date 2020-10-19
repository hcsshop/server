const { Quickbooks } = require('./quickbooks.class')
const hooks = require('./quickbooks.hooks')

module.exports = function (app) {
  const options = app.get('quickbooks.service.options')
  const ServiceInstance = new Quickbooks(options, app)
  app.use('/quickbooks', ServiceInstance)
  const service = app.service('intuit')
  service.hooks(hooks)
}
