# fastify-single-user-cache

[![Build
Status](https://travis-ci.com/mcollina/fastify-single-user-cache.svg?branch=master)](https://travis-ci.com/mcollina/fastify-single-user-cache)

Provide a cache for each request, so multiple fetches of the same data
are not performed. Moreover, it provides an API to batch requests, so
that a bulk query can be done to a database or an external endpoint.

The core caching functionality is provided by
[single-user-cache](http://npm.im/single-user-cache).

This is similar to Facebook Data Loader pattern.

## Install

```
npm i fastify-single-user-cache
```

## Usage

```js
const fastify = require('fastify')

const app = fastify()

app.register(require('fastify-single-user-cache'), {
  // key  is the property that is going to be decorated in the
  // app, Request and Reply
  key: 'data'
})

// We wrap our data definitions and routes in a plugin, so
// the cache plugin can actually load asynchronously.
app.register(async function (app) {

  // The result of this functions will be caches for the lifetime
  // of the request.
  app.data.add('fetchSomething', async (queries, { req, reply }) => {
    // queries include an array of all the requested ids
    reply.log.info({ queries }, 'executing fetchSomething')

    // It must return an array of length queries.length.
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

app.listen(3000)
```

## License

MIT
