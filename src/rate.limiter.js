const RateLimiter = require('@kidkarolis/not-so-fast')
const Errors = require('@feathersjs/errors')

module.exports = (options = {}) => {
  const { threshold, ttl, namespace, errorMessage, errorData } = options
  const messageLimiter = new RateLimiter({ threshold, ttl })

  return async context => {
    const _namespace = namespace || context.params.ip || 'default'

    // Do not limit these namespaces
    if (['::1', '127.0.0.1', 'default'].includes(_namespace)) return context

    try {
      await messageLimiter.consume(_namespace)
    } catch (e) {
      throw new Errors.TooManyRequests(errorMessage || 'Too many requests', errorData)
    }

    return context
  }
}
