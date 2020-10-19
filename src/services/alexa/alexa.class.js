const alexa = require('alexa-app')

exports.Alexa = class Alexa {
  constructor (options, app) {
    this.options = options || {}
    this.logger = app.get('logger')

    const apps = [
      {
        name: 'bridge',
        endpoint: '/alexa/bridge',
        title: 'ORS Alexa Bridge',
        handler: (req, res) => {
          console.log('Handler:', { req, res })
        }
      }
    ]

    this.apps = apps.map(a => ({ ...a, app: new alexa.app(a.title, a.endpoint) })) // eslint-disable-line
    this.apps.forEach(a => a.app.express({ expressApp: app }))
  }

  async find (params) {
    return []
  }

  async get (id, params) {
    return {}
  }

  async create (data, params) {
    if (Array.isArray(data)) {
      return Promise.all(data.map(current => this.create(current, params)))
    }

    try {
      // const result = await this.client.messages.create({
      //   body: data.text,
      //   to: data.to,
      //   from: this.options.twilio.from
      // })

      // return result
      return null
    } catch (err) {
      console.error(err)
      return err
    }
  }

  async update (id, data, params) {
    return data
  }

  async patch (id, data, params) {
    return data
  }

  async remove (id, params) {
    return { id }
  }
}
