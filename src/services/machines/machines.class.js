const { Service } = require('feathers-mongoose')

exports.Orders = class Orders extends Service {
  constructor (options, app) {
    super(options, app)
    this.logger = app.get('logger')
  }

  async create (data, params) {
    this.logger.info('Creating machine:', { metadata: data })
    return super.create(data, params).catch(error => {
      this.logger.error(error)
    })
  }
}
