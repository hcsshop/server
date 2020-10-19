const services = [
  require('./public/public.service'),
  require('./users/users.service'),
  require('./customers/customers.service'),
  require('./appointments/appointments.service'),
  require('./machines/machines.service'),
  require('./orders/orders.service'),
  require('./settings/settings.service'),
  require('./intuit/intuit-oauth.service'),
  require('./quickbooks/quickbooks.service'),
  process.env.TWILIO_ENABLED === 'true' && require('./sms-twilio/sms-twilio.service'),
  process.env.MAILGUN_ENABLED === 'true' && require('./email-mailgun/email-mailgun.service'),
  process.env.S3_ENABLED === 'true' && require('./storage-s3/storage-s3.service'),
  require('./storage/storage.service'),
  require('./alexa/alexa.service')
]

module.exports = function (app) {
  services.forEach(s => app.configure(s))
}
