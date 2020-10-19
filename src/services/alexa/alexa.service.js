// Initializes the `SMS-Twilio` service on path `/sms-twilio`
const { Alexa } = require('./alexa.class')
const hooks = require('./alexa.hooks')

module.exports = function (app) {
  const options = {}

  app.use('/alexa', new Alexa(options, app))

  const service = app.service('alexa')
  service.hooks(hooks)
}
