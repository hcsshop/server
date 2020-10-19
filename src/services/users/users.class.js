const { Service } = require('feathers-mongoose')

exports.Users = class Users extends Service {
  constructor (options, app) {
    super(options, app)
    this.logger = app.get('logger')
  }

  create (data, params) {
    if (!data.permissions) data.permissions = ['user']

    return super.create(data, params).catch(error => {
      this.logger.error(error)
    })
  }
}
