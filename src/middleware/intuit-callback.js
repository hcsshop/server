const { BadRequest } = '@feathersjs/errors'

module.exports = function (app) {
  app.use(async (req, res, next) => {
    if (!req.url.includes('/intuit-callback')) return next()

    const authResponse = await app.service('intuit').oauth.createToken(req.url)

    if (authResponse && authResponse.token) {
      app.service('intuit').oauth.setToken(authResponse.token)
      app.get('logger').silly('Got intuit token', authResponse.token)
      app.service('settings').update('quickbooks.token', { title: 'Quickbooks Token', category: 'Hidden', type: 'text', text: JSON.stringify(authResponse.token) })
      return res.redirect(process.env.PUBLIC_URL || app.get('public_url') || 'http://localhost:3000')
    } else {
      app.get('logger').error('Intuit', { metadata: 'Could not get oauth token' })
      throw new BadRequest('Error getting Intuit access token', authResponse)
    }
  })
}
