'use strict'

const fp = require('fastify-plugin')
const { Factory } = require('single-user-cache')

module.exports = fp(async function (app) {
  const factory = new Factory()
  app.decorate('data', factory)

  app.decorateRequest('data', null)
  app.decorateReply('data', null)
  app.addHook('onRequest', function (req, reply, next) {
    req.data = reply.data = factory.create()
    next()
  })
})
