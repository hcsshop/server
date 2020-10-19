const { Intuit } = require('./intuit-oauth.class')
const hooks = require('./intuit-oauth.hooks')

module.exports = function (app) {
  const options = app.get('intuit-options') || {}
  const ServiceInstance = new Intuit(options, app)
  app.use('/intuit', ServiceInstance)
  const service = app.service('intuit')
  service.hooks(hooks)
}
