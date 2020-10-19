const services = [
  require('./public/public.service'),
  require('./users/users.service'),
  require('./customers/customers.service'),
  require('./appointments/appointments.service'),
  require('./machines/machines.service'),
  require('./orders/orders.service'),
  require('./settings/settings.service'),
  require('./intuit/intuit-oauth.service'),
  require('./quickbooks/quickbooks.service'), // TODO: Make this conditional like the others
  require('./storage/storage.service')
]

if (process.env.TWILIO_ENABLED === 'true') services.push(require('./sms-twilio/sms-twilio.service'))
if (process.env.MAILGUN_ENABLED === 'true') services.push(require('./email-mailgun/email-mailgun.service'))
if (process.env.S3_ENABLED === 'true') services.push(require('./storage-s3/storage-s3.service'))
if (process.env.ALEXA_ENABLED === 'true') services.push(require('./alexa/alexa.service'))

module.exports = function (app) {
  services.forEach(s => app.configure(s))
}
