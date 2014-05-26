patrun-emitter&nbsp;&nbsp;[![Build Status](https://travis-ci.org/mcollina/patrun-emitter.png)](https://travis-ci.org/mcollina/patrun-emitter)
=================================================================

An Opinionated Message Queue with an emitter-style API, but with
objects as events, plus callbacks.

  * <a href="#install">Installation</a>
  * <a href="#basic">Basic Example</a>
  * <a href="#api">API</a>
  * <a href="#licence">Licence &amp; copyright</a>

<a name="install"></a>
## Installation

```
$ npm install patrun-emitter --save
```

<a name="basic"></a>
## Basic Example

```js
var mq = require('patrun-emitter')
  , emitter = mq({ concurrency: 5 })
  , message

emitter.on({ topic: 'hello world' }, function(message, cb) {
  // call callback when you are done
  // do not pass any errors, the emitter cannot handle it.
  cb()
})

// topic is just a convetion
// we can use anything else!
message = { topic: 'hello world', payload: 'or any other fields' }
emitter.emit(message, function() {
  // emitter will never return an error
})
```

## API

  * <a href="#mq"><code>PatrunEmitter</code></a>
  * <a href="#emit"><code>emitter#<b>emit()</b></code></a>
  * <a href="#on"><code>emitter#<b>on()</b></code></a>
  * <a href="#removeListener"><code>emitter#<b>removeListener()</b></code></a>

-------------------------------------------------------
<a name="mq"></a>
### PatrunEmitter(opts)

PatrunEmitter is the class and function exposed by this module.
It can be created by `PatrunEmitter()` or using `new PatrunEmitter()`.

An PatrunEmitter accepts the following options:

- `concurrency`: the maximum number of concurrent messages that can be
  on concurrent delivery.

-------------------------------------------------------
<a name="emit"></a>
### emitter.emit(message, callback())

Emit the given message.

-------------------------------------------------------
<a name="on"></a>
### emitter.on(pattern, callback(message, done))

Add the given callback to the passed pattern, see
[patrun](http://npm.im/patrun) for the matching rules.

The `callback`, accept two parameters, the passed message and a `done`
callback.

The callback __must never error__ and `done` must not be called with an
__`err`__ object.

-------------------------------------------------------
<a name="removeListener"></a>
### emitter.removeListener(pattern, callback)

The inverse of `on`.

## LICENSE

Copyright (c) 2014, Matteo Collina <hello@matteocollina.com>

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR
IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
