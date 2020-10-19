const path = require('path')
const favicon = require('serve-favicon')
const compress = require('compression')
const helmet = require('helmet')
const cors = require('cors')

const feathers = require('@feathersjs/feathers')
const configuration = require('@feathersjs/configuration')
const express = require('@feathersjs/express')
const primus = require('@feathersjs/primus')

const middleware = require('./middleware')
const services = require('./services')
const appHooks = require('./app.hooks')
const channels = require('./channels')
const authentication = require('./authentication')
const mongoose = require('./mongoose')
const logger = require('./logger')
const RateLimiter = require('./rate.limiter')

const app = express(feathers())

app.disable('x-powered-by')

// Load app configuration
app.configure(configuration())
app.configure(logger)
app.set('mongodb', process.env.MONGODB)

const shopConfig = app.get('shop')
shopConfig.admin.name = process.env.SHOP_ADMIN_NAME || shopConfig.admin.name
shopConfig.admin.email = process.env.SHOP_ADMIN_EMAIL || shopConfig.admin.email
shopConfig.admin.password = process.env.SHOP_ADMIN_PASSWORD || shopConfig.admin.password
app.set('shop', shopConfig)

const authConfig = app.get('authentication')
authConfig.secret = process.env.AUTH_SECRET
authConfig.jwtOptions.audience = process.env.JWT_AUDIENCE
authConfig.oauth.google.key = process.env.OAUTH_GOOGLE_KEY
authConfig.oauth.google.secret = process.env.OAUTH_GOOGLE_SECRET
authConfig.oauth.facebook.key = process.env.OAUTH_FACEBOOK_KEY
authConfig.oauth.facebook.secret = process.env.OAUTH_FACEBOOK_SECRET
authConfig.oauth.twitter.key = process.env.OAUTH_TWITTER_KEY
authConfig.oauth.twitter.secret = process.env.OAUTH_TWITTER_SECRET
authConfig.oauth.github.key = process.env.OAUTH_GITHUB_KEY
authConfig.oauth.github.secret = process.env.OAUTH_GITHUB_SECRET
app.set('authentication', authConfig)

const storageConfig = app.get('storage')
if (process.env.S3_ENABLED === 'true') {
  storageConfig.s3 = {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    bucketName: process.env.S3_BUCKET_NAME
  }
}
app.set('storage', storageConfig)

const emailConfig = app.get('email')
if (process.env.MAILGUN_ENABLED === 'true') {
  emailConfig.mailgun = {
    apiKey: process.env.MAILGUN_API_KEY,
    domain: process.env.MAILGUN_DOMAIN,
    fromAddress: process.env.MAILGUN_FROM_ADDRESS
  }
}
app.set('email', emailConfig)

const telephonyConfig = app.get('telephony')
if (process.env.MAILGUN_ENABLED === 'true') {
  telephonyConfig.twilio = {
    from: process.env.TWILIO_FROM_NUMBER,
    accountSID: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN
  }
}
app.set('email', emailConfig)

// Enable security, CORS, compression, favicon and body parsing
app.use(helmet())
app.use(cors())
app.use(compress())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(favicon(path.join(app.get('public'), 'favicon.ico')))

// Set up Plugins and providers
app.configure(express.rest())

app.configure(primus({ transformer: 'websockets' }))
app.configure(mongoose)
app.configure(middleware)
app.configure(authentication)
app.configure(services)
app.configure(channels)

app.hooks({
  before: RateLimiter(app.get('apiLimiter'))
})

app.service('authentication').hooks({
  before: RateLimiter(app.get('authLimiter'))
})

const errorTemplate = (error, req, res, next) => {
  const { ip, url, query, params, body } = req

  const template = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Whoopsie!</title>
    </head>
    <body>
      <h1>If you're seeing this, there's been a problem.</h1>
      <pre>${JSON.stringify(error, null, 2)}</pre>
      <pre>${JSON.stringify({ ip, url, query, params, body }, null, 2)}</pre>
      <hr />
      <h3><a href="${process.env.PUBLIC_URL || 'http://localhost:3000'}">Click here to retry</a></h3>
    </body>
    </html>
  `

  return res.status(error.code).send(template)
}

app.use(express.notFound())
app.use(express.errorHandler({
  logger,
  html: errorTemplate
}))

app.hooks(appHooks)

const createInitialUser = async () => {
  const { logger } = app.locals.settings

  try {
    const users = await app.service('users').find({
      query: {
        $limit: 0
      }
    })

    if (users.total === 0) {
      const { name, email, password } = app.get('shop').admin
      logger.warn('No users exist; creating initial admin account', { metadata: { name, email, password } })

      await app.service('users').create({
        email,
        password,
        permissions: ['*', 'admin'],
        profile: { name }
      })
    }
  } catch (err) {
    logger.error('Error creating initial admin user', err.toString())
  }
}

const createInitialSettings = async () => {
  const { logger } = app.locals.settings

  try {
    const settings = await app.service('settings').find({
      query: {
        $limit: 0
      }
    })

    if (settings.total === 0) {
      const defaultSettings = app.get('settings')
      logger.warn('No settings are defined; using defaults')

      defaultSettings.forEach(async setting => {
        await app.service('settings').create(setting)
      })
    }
  } catch (err) {
    logger.error('Error creating default settings', err.toString())
  }
}

createInitialUser()
createInitialSettings()

module.exports = app
