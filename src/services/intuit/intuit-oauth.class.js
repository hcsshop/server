const OAuthClient = require('intuit-oauth')

exports.Intuit = class Intuit {
  constructor (options, app) {
    this.app = app
    this.logger = app.get('logger')

    // const { clientId, clientSecret, environment, redirectUri } = app.get('intuit')

    const intuitSettings = {
      clientId: process.env.INTUIT_CLIENT_ID,
      clientSecret: process.env.INTUIT_CLIENT_SECRET,
      redirectUri: process.env.INTUIT_REDIRECT_URI,
      environment: process.env.INTUIT_ENVIRONMENT || 'sandbox',
      logging: process.env.INTUIT_LOGGING === 'true'
    }

    app.set('intuit', intuitSettings)

    this.oauth = new OAuthClient(intuitSettings)
    app.set('intuit-oauth', this.oauth)

    const init = async () => {
      try {
        const tokenData = await app.service('settings').get('quickbooks.token')

        try {
          const token = JSON.parse(tokenData.text)
          this.oauth.setToken(token)
          this.refresh()

          this.intuitRefreshInterval = setInterval(() => {
            this.refresh()
          }, 2700000)
        } catch (err) {
          this.logger.error('[intuit-oauth]', { metadata: { err } })
        }
      } catch (err) {
        this.logger.error('No initial token')
      }
    }

    init()
  }

  async quickbooks ({ action, query, urlParams, method, headers, body }) {
    try {
      const companyID = this.oauth.getToken().realmId
      if (!companyID) throw new Error('No company ID. Not connected to QB?')

      const url = this.oauth.environment !== 'production' ? OAuthClient.environment.sandbox : OAuthClient.environment.production
      const apiUrl = `${url}v3/company/${companyID}/${action}${urlParams || ''}${query || ''}`

      this.logger.silly(`Contacting QB: ${apiUrl}`)

      const authResponse = await this.oauth.makeApiCall({
        method: method || 'GET',
        url: apiUrl,
        headers,
        body
      })

      if (authResponse.json.fault) throw new Error(authResponse.json.fault.error)
      return authResponse.json
    } catch (err) {
      this.logger.error(err)
      if (err.error) throw new Error(err.error)
      throw err
    }
  }

  async refresh () {
    if (!this.oauth.getToken()) return false

    try {
      const token = await this.oauth.refresh()
      this.oauth.setToken(token.token)
      this.app.service('settings').update('quickbooks.token', { title: 'Quickbooks Token', category: 'Hidden', type: 'text', text: JSON.stringify(token.token) })
      return token
    } catch (err) {
      this.logger.error('Error refreshing Quickbooks token', err)
      return err
    }
  }

  async isActive (params) {
    return this.oauth.isAccessTokenValid()
  }

  async company (params) {
    const result = await this.quickbooks({
      action: 'companyinfo',
      urlParams: `/${this.oauth.getToken().realmId}`
    })

    return result
  }

  async oauthObject (params) {
    return this.oauth
  }

  async get (id, params) {
    if (typeof this[id] === 'function') return await this[id](params)
    return false
  }

  async find (params) {
    const { id } = params.query

    switch (id) {
      case 'authUrl':
        return this.oauth.authorizeUri({
          state: (Math.random() * Date.now()).toString(36),
          scope: [OAuthClient.scopes.Accounting]
        })
    }
  }

  async update (id, data, params) {
    try {
      // console.log(id, data)
      // this.oauth.setToken()
    } catch (err) {
      this.logger.error(err)
    }
  }
}
