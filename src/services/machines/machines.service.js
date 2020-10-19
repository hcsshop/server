const { Orders } = require('./machines.class')
const createModel = require('../../models/machines.model')
const hooks = require('./machines.hooks')

module.exports = function (app) {
  const options = {
    id: 'uuid',
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: ['create'],
    whitelist: ['$regex', '$options']
  }

  app.use('/machines', new Orders(options, app))
  const service = app.service('machines')
  service.hooks(hooks)
}
