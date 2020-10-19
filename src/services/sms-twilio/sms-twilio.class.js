const Twilio = require('twilio')

exports.SmsTwilio = class SmsTwilio {
  constructor (options, app) {
    this.options = options || {}
    this.logger = app.get('logger')
    this.client = new Twilio(this.options.twilio.accountSID, this.options.twilio.authToken)
  }

  async find (params) {
    return []
  }

  async get (id, params) {
    return {
      id, text: `A new message with ID: ${id}!`
    }
  }

  async create (data, params) {
    if (Array.isArray(data)) {
      return Promise.all(data.map(current => this.create(current, params)))
    }

    this.logger.verbose('Create SMS!', data)

    try {
      const result = await this.client.messages.create({
        body: data.text,
        to: data.to,
        from: this.options.twilio.from
      })

      return result
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
