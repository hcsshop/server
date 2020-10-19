require('dotenv').config()

const Package = require('../package')
const figlet = require('figlet')

const app = require('./app')
const port = app.get('port')
const server = app.listen(port)

const { logger } = app.locals.settings

app.set('figlet', figlet)
app.set('package', Package)
app.set('shop-name', process.env.SHOP_NAME || app.get('shop').name || 'ORS')

process.on('unhandledRejection', (reason, p) => {
  logger.error('Unhandled Rejection at: Promise ', p, reason)
})

server.on('listening', () => {
  const banner = figlet.textSync(process.env.CONSOLE_BANNER || process.env.SHOP_ABBR || app.get('shop').abbr || process.env.SHOP_NAME || app.get('shop-name') || 'OnRepairShop', {
    font: process.env.CONSOLE_BANNER_FONT || app.get('shop').bannerFont || 'The Edge',
    horizontalLayout: 'default',
    verticalLayout: 'default'
  })

  console.log(banner)

  const herokuHost = process.env.HEROKU_APP_NAME ? `${process.env.HEROKU_APP_NAME}.herokuapp.com` : null
  logger.info(`${app.get('shop-name')}`, { metadata: { version: Package.version, host: herokuHost || app.get('host'), port } })
})
