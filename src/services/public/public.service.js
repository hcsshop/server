const Public = class {
  constructor (options, app) {
    this.app = app
    this.options = options
  }

  async get (id, params) {
    switch (id) {
      case 'shop.name':
        return await this.app.get('shop-name')
    }
  }
}

module.exports = app => {
  const options = app.get('public.options')
  const ServiceInstance = new Public(options, app)
  app.use('/public', ServiceInstance)
}
