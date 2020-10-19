const { Orders } = require('./orders.class')
const createModel = require('../../models/orders.model')
const hooks = require('./orders.hooks')

const QRCode = require('qrcode')
const aes = require('crypto-js/aes')
const path = require('path')
const pug = require('pug')
const axios = require('axios').default
const moment = require('moment')
const MarkdownIt = require('markdown-it')

const markdown = new MarkdownIt()

module.exports = function (app) {
  const options = {
    id: 'uuid',
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: ['create'],
    whitelist: ['$regex', '$options']
  }

  app.use('/orders/print/:item', {
    async get (id, params) {
      try {
        let logoURL = null

        try {
          logoURL = (await app.service('settings').get('orders.logoURL')).text
        } catch (err) {
          console.warn(err)
        }

        const order = await app.service('orders').get(id)
        const orderQRCode = await QRCode.toDataURL(`O:${order.uuid}`)
        const customerQRCode = await QRCode.toDataURL(`C:${order.customerData.uuid}`)

        let intakePasswords = []

        if (process.env.SYMMETRIC_SECRET) {
          for await (const item of order.intakePasswords) {
            const encrypted = aes.encrypt(item.value, process.env.SYMMETRIC_SECRET).toString()
            const qr = await QRCode.toDataURL(`PASS:${encrypted}`)
            intakePasswords.push({ ...item, qr, encrypted })
          }
        } else {
          intakePasswords = order.intakePasswords
        }

        const html = pug.renderFile(path.join(__dirname, '../..', `print-templates/order-${params.route.item}.pug`), {
          order, intakePasswords, logoURL, QRCode, orderQRCode, customerQRCode, markdown, moment
        })

        const result = await axios.post(`${process.env.PDF_PRINTER_URL}/convert`, {
          html,
          format: 'base64',
          paperSize: 'Letter',
          zoomFactor: 0.6
        })

        if (result.status !== 200) throw new Error('PDFify Server rejected conversion')
        return result.data
      } catch (err) {
        console.error(err.data)
        return { error: err.message }
      }
    }
  })

  app.use('/orders', new Orders(options, app))

  const service = app.service('orders')
  service.hooks(hooks)
}
