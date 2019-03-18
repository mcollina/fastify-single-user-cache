'use strict'

const { test } = require('tap')
const fastify = require('fastify')
const Cache = require('.')

function build (t, opts) {
  const app = fastify()
  app.register(Cache, opts)
  t.tearDown(app.close.bind(app))

  return app
}

test('fetch data and cache things from request', async (t) => {
  t.plan(2)

  const app = build(t)

  // The plugin is needed to be able to access the cache.
  app.register(async function (app) {
    app.data.add('fetchSomething', async (queries) => {
      t.deepEqual(queries, [42, 24])

      return queries.map((k) => {
        return { k }
      })
    })

    app.get('/', async (req, reply) => {
      const data = await Promise.all([
        req.data.fetchSomething(42),
        req.data.fetchSomething(24)
      ])

      return data
    })
  })

  const res = await app.inject('/')

  t.deepEqual(JSON.parse(res.body), [{
    k: 42
  }, {
    k: 24
  }])
})

test('fetch data and cache things from reply', async (t) => {
  t.plan(2)

  const app = build(t)

  // The plugin is needed to be able to access the cache.
  app.register(async function (app) {
    app.data.add('fetchSomething', async (queries) => {
      t.deepEqual(queries, [42, 24])

      return queries.map((k) => {
        return { k }
      })
    })

    app.get('/', async (req, reply) => {
      const data = await Promise.all([
        reply.data.fetchSomething(42),
        reply.data.fetchSomething(24)
      ])

      return data
    })
  })

  const res = await app.inject('/')

  t.deepEqual(JSON.parse(res.body), [{
    k: 42
  }, {
    k: 24
  }])
})
