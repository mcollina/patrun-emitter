
var test = require('tap').test
  , mq = require('./')

test('support on and emit', function(t) {
  t.plan(3)

  var e = mq()
    , expected = {
        topic: 'hello world',
        my: 'message'
      }

  e.on({ topic: 'hello world' }, function(message, cb) {
    t.equal(e.current, 1, 'number of current messages')
    t.equal(message, expected)
    t.equal(this, e)
    cb()
  })

  e.emit(expected, function() {
    t.end()
  })
})

test('support multiple subscribers', function(t) {
  t.plan(2)

  var e = mq()
    , expected = {
          topic: 'hello world'
        , payload: { my: 'message' }
      }

  e.on({ topic: 'hello world' }, function(message, cb) {
    t.ok(true)
    cb()
  })

  e.on({ topic: 'hello world' }, function(message, cb) {
    t.ok(true)
    cb()
  })

  e.emit(expected, function() {
    t.end()
  })
})

test('queue concurrency', function(t) {
  t.plan(4)

  var e = mq({ concurrency: 1 })
    , expected = {
          topic: 'hello world'
        , payload: { my: 'message' }
      }
    , start
    , intermediate
    , finish

  t.equal(e.concurrency, 1)

  e.on({ hello: 1 }, function(message, cb) {
    setTimeout(cb, 5)
  })

  e.on({ hello: 2 }, function(message, cb) {
    cb()
  })

  start = Date.now()
  e.emit({ hello: 1, some: 'data' }, function() {
    intermediate = Date.now()
    t.ok(intermediate - start >= 5, 'min 5 ms between start and intermediate')
    t.equal(e.length, 1)
  })

  e.emit({ hello: 2, some: 'data' }, function() {
    finish = Date.now()
    t.ok(finish - intermediate < 5, 'max 5 ms between intermediate and finish')
    t.end()
  })
})

test('removeListener', function(t) {
  var e = mq()
    , expected = {
          topic: 'hello world'
        , payload: { my: 'message' }
      }

  e.on({ topic: 'hello world' }, function(message, cb) {
    cb()
  })

  function toRemove(message, cb) {
    t.ok(false, 'the toRemove function must not be called')
    t.end()
  }

  e.on({ topic: 'hello world' }, toRemove)

  e.removeListener({ topic: 'hello world' }, toRemove)

  e.emit(expected, function() {
    t.end()
  })
})

test('removeListener (bis)', function(t) {
  var e = mq()
    , expected = {
          topic: 'hello world'
        , payload: { my: 'message' }
      }

  function toRemove(message, cb) {
    t.ok(false, 'the toRemove function must not be called')
    t.end()
  }

  e.on({ topic: 'hello world' }, toRemove)

  e.on({ topic: 'hello world' }, function ok(message, cb) {
    cb()
  })

  e.removeListener({ topic: 'hello world' }, toRemove)

  e.emit(expected, function() {
    t.end()
  })
})

test('without a callback on emit', function(t) {
  var e = mq()
    , expected = {
          topic: 'hello world'
        , payload: { my: 'message' }
      }

  e.on({ topic: 'hello world' }, function(message, cb) {
    cb()
    t.end()
  })

  e.emit(expected)
})

test('without any listeners', function(t) {
  var e = mq()
    , expected = {
          topic: 'hello world'
        , payload: { my: 'message' }
      }

  e.emit(expected)
  t.equal(e.current, 0, 'reset the current messages trackers')
  t.end()
})

test('without any listeners and a callback', function(t) {
  var e = mq()
    , expected = {
          topic: 'hello world'
        , payload: { my: 'message' }
      }

  e.emit(expected, function() {
    t.equal(e.current, 1, 'there 1 message that is being processed')
    t.end()
  })
})

test('support multiple patterns', function(t) {
  t.plan(1)

  var e = mq()
    , expected = {
          hello: 'world'
        , some: 'data'
        , payload: { my: 'message' }
      }

  e.on({ 
      hello: 'world'
    , some: 'data'
  }, function(message, cb) {
    t.deepEqual(message, expected)
    cb()
  })

  // this will not be catched
  e.emit({
      hello: 'matteo'
    , some: 'data'
  })

  // this will be catched
  e.emit(expected)
})

