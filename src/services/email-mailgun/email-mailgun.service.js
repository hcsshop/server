// Initializes the `SMS-Twilio` service on path `/sms-twilio`
const { EmailMailgun } = require('./email-mailgun.class')
const hooks = require('./email-mailgun.hooks')

module.exports = function (app) {
  const options = {
    mailgun: app.get('email').mailgun
  }

  app.use('/email-mailgun', new EmailMailgun(options, app))
  const service = app.service('email-mailgun')
  service.hooks(hooks)
}
