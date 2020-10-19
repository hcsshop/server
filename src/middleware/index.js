module.exports = function (app) {
  require('./intuit-callback')(app)

  app.use((req, res, next) => {
    req.feathers.ip = req.ip
    req.feathers.url = req.url
    req.feathers.headers = req.headers
    req.feathers.responseHeaders = res.headers
    req.feathers.logger = app.get('logger')
    return next()
  })
}
