'use strict'

const fp = require('fastify-plugin')
const { Factory } = require('single-user-cache')

module.exports = fp(async function (app, opts) {
  const factory = new Factory()
  const key = opts.key || 'data'
  app.decorate(key, factory)

  app.decorateRequest(key, null)
  app.decorateReply(key, null)
  app.addHook('onRequest', function (req, reply, next) {
    req[key] = reply[key] = factory.create({ req, reply })
    next()
  })
})
