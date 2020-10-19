const { Service } = require('feathers-mongoose')

exports.Appointments = class Appointments extends Service {
  constructor (options, app) {
    super(options, app)
    this.logger = app.get('logger')
  }

  async create (data, params) {
    // this.logger.info('Creating appointment:', { metadata: data })
    return super.create(data, params).catch(error => {
      this.logger.error(error)
    })
  }
}
