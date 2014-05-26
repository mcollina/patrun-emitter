/*
 * Copyright (c) 2014, Matteo Collina <hello@matteocollina.com>
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR
 * IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
*/

"use strict";

var patrun = require('patrun')
  , assert = require('assert')
  , nop = function() {}

function PatrunEmitter(opts) {
  if (!(this instanceof PatrunEmitter)) {
    return new PatrunEmitter(opts)
  }

  opts = opts || {}

  this._messageQueue = []
  this._messageCallbacks = []

  this.concurrency = opts.concurrency

  this.current = 0
  this._matcher = patrun();
}

Object.defineProperty(PatrunEmitter.prototype, "length", {
  get: function() {
    return this._messageQueue.length;
  },
  enumerable: true
});

PatrunEmitter.prototype.on = function on(pattern, notify) {
  assert(pattern)
  assert(notify)

  var matches = this._matcher.find(pattern, true)

  if (matches) {
    matches.push(notify)
  } else {
    this._matcher.add(pattern, [notify])
  }

  return this
}

PatrunEmitter.prototype.removeListener = function removeListener(pattern, notify) {
  assert(pattern)
  assert(notify)

  var matches = this._matcher.find(pattern, true)
    , i

  if (matches) {
    i = matches.indexOf(notify)

    matches.splice(i, 1)

    if (matches.length === 0) {
      this._matcher.remove(pattern)
    }
  }

  return this
}

PatrunEmitter.prototype.emit = function emit(message, cb) {
  assert(message)

  cb = cb || nop

  if (this.concurrency > 0 && this.current >= this.concurrency) {
    this._messageQueue.push(message)
    this._messageCallbacks.push(cb)
  } else {
    this.current++
    this._do(message, cb, new CallbackReceiver(this))
  }

  return this
}

PatrunEmitter.prototype._next = function next(receiver) {
  var message = this._messageQueue.shift()
    , callback = this._messageCallbacks.shift()

  if (!message) {
    // we are at the end of the queue
    this.current--
  } else {
    this._do(message, callback, receiver)
  }

  return this
}

PatrunEmitter.prototype._do = function(message, callback, receiver) {
  var matches = this._matcher.find(message)
    , i

  if (!matches || matches.length === 0) {
    callback()
    return this._next(receiver)
  }

  receiver.num = matches.length
  receiver.callback = callback

  for (i = 0; i < matches.length; i++) {
    matches[i].call(this, message, receiver.counter);
  }

  return this
}

function CallbackReceiver(mq) {
  // these will be initialized by the caller
  this.num = -1
  this.callback = null

  var that = this

  this.counter = function() {
    that.num--;

    if (that.num === 0) {
      that.callback()
      mq._next(that)
    }
  }
}

module.exports = PatrunEmitter
