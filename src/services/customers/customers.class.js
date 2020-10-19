const { Service } = require('feathers-mongoose')

exports.Customers = class Customers extends Service {
  constructor (options, app) {
    super(options, app)
    this.logger = app.get('logger')
  }

  create (data, params) {
    // this.logger.info('Creating/upserting customer:', { metadata: data })
    params.mongoose = { upsert: true }
    return super.create(data, params).catch(error => {
      this.logger.error(error)
    })
  }
}
