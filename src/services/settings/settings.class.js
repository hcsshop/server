const { Service } = require('feathers-mongoose')

exports.Settings = class Settings extends Service {
  constructor (options, app) {
    super(options, app)
    this.logger = app.get('logger')
    this.app = app
  }

  async update (id, data, params) {
    params.mongoose = { upsert: true }
    return await super.update(id, data, params)
  }

  async get (id, params) {
    return await super.get(id, params)
  }
}
