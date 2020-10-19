// Initializes the `SMS-Twilio` service on path `/sms-twilio`
const { SmsTwilio } = require('./sms-twilio.class')
const hooks = require('./sms-twilio.hooks')

module.exports = function (app) {
  const options = {
    twilio: app.get('telephony').twilio
  }

  app.use('/sms-twilio', new SmsTwilio(options, app))
  const service = app.service('sms-twilio')
  service.hooks(hooks)
}
