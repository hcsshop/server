const Mailgun = require('mailgun-js')
const dataUriToBuffer = require('data-uri-to-buffer')

exports.EmailMailgun = class EmailMailgun {
  constructor (options, app) {
    this.options = options || {}
    this.logger = app.get('logger')
    this.client = Mailgun({ apiKey: this.options.mailgun.apiKey, domain: this.options.mailgun.domain })
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

    const emailData = {
      from: `${data.fromName ? data.fromName : ''}${this.options.mailgun.fromAddress}`,
      to: data.to,
      subject: data.subject,
      text: data.text,
      html: data.html
    }

    // TODO: Allow multiple attachments
    if (data.attachment) {
      try {
        const buffer = dataUriToBuffer(data.attachment.data)
        emailData.inline = new this.client.Attachment({ data: buffer, filename: data.attachment.filename, contentType: data.attachment.contentType || 'text/plain' })
      } catch (err) {
        console.error(err)
      }
    }

    return await this.client.messages().send(emailData)
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
