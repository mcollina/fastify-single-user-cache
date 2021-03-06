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

function buildTests (opts = {}) {
  const key = opts.key || 'data'

  test('fetch data and cache things from request', async (t) => {
    t.plan(4)

    const app = build(t, opts)
    let _req
    let _reply

    // The plugin is needed to be able to access the cache.
    app.register(async function (app) {
      app[key].add('fetchSomething', async (queries, context) => {
        t.deepEqual(queries, [42, 24])
        t.equal(context.req, _req)
        t.equal(context.reply, _reply)

        return queries.map((k) => {
          return { k }
        })
      })

      app.get('/', async (req, reply) => {
        _req = req
        _reply = reply
        const data = await Promise.all([
          req[key].fetchSomething(42),
          req[key].fetchSomething(24)
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
    t.plan(4)

    const app = build(t, opts)
    let _req
    let _reply

    // The plugin is needed to be able to access the cache.
    app.register(async function (app) {
      app[key].add('fetchSomething', async (queries, context) => {
        t.deepEqual(queries, [42, 24])
        t.equal(context.req, _req)
        t.equal(context.reply, _reply)

        return queries.map((k) => {
          return { k }
        })
      })

      app.get('/', async (req, reply) => {
        _req = req
        _reply = reply
        const data = await Promise.all([
          reply[key].fetchSomething(42),
          reply[key].fetchSomething(24)
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
}

buildTests()
buildTests({ key: 'foobar' })
