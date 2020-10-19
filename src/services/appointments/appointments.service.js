const moment = require('moment')

const { Appointments } = require('./appointments.class')
const createModel = require('../../models/appointments.model')
const hooks = require('./appointments.hooks')

module.exports = function (app) {
  const options = {
    id: 'uuid',
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: ['create'],
    whitelist: ['$regex', '$options']
  }

  app.use('/appointments', new Appointments(options, app))
  const service = app.service('appointments')
  service.hooks(hooks)

  const DAY_MS = 24 * 60 * 60 * 1000
  const appointmentChecker = () => {
    const go = async () => {
      const appointmentsData = await service.find({ query: { 'spacetime.start': { $gt: new Date().getTime(), $lte: new Date().getTime() + (DAY_MS * 2) } } })
      const appointments = appointmentsData.data
      app.get('logger').silly(`[APPT:Check] ${appointments.length} appointments within the next 2 days`)

      appointments.forEach(appt => {

      })
    }

    go()
  }

  const appointmentCheckerInterval = setInterval(appointmentChecker, 60000) // eslint-disable-line
  appointmentChecker()
}
