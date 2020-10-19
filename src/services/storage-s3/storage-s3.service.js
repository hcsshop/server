const { StorageS3 } = require('./storage-s3.class')
const hooks = require('./storage-s3.hooks')

module.exports = function (app) {
  const options = {
    storage: app.get('storage').s3
  }

  app.use('/storage-s3', new StorageS3(options, app))
  const service = app.service('storage-s3')
  service.hooks(hooks)
}
