var expat = require('node-expat')
var util = require('util')
var stream = require('stream')

/**
 * XML parsing with Expat to a JavaScript object.
 *
 * @see http://expat.sourceforge.net/
 *
 * Expat is a SAX style XML parser that is really fast.
 *
 * Emits `end` when parsing ends.
 *
 * @param {String|Function} [encoding]
 *   Expected character encoding of the XML to be parsed.
 *   Built in encodings are:
 *    - UTF-8
 *    - UTF-16
 *    - ISO-8859-1
 *    - US-ASCII
 *
 *   If the encoding is a function, it will be treated as `callback`.
 *
 * @param {Function} [callback]
 *   Optional function to be called when the parsing ends.
 */
var Parser = function (encoding, callback) {
  var that = this
  var stack = []
  var defaultEncoding = 'UTF-8'

  if (typeof encoding === 'function') {
    callback = encoding
    encoding = defaultEncoding
  }
  // Make the sax parser.
  this.saxParser = new expat.Parser(encoding || defaultEncoding)
  // Always use the '#' key, even if there are no subkeys.
  this.EXPLICIT_CHARKEY = false
  if (callback) {
    this.on('end', function (result) {
      callback(that.getError(), result)
    })
    this.on('error', callback)
  }

  // New  element arrived handle it.
  this.saxParser.on('startElement', function (name, attributes) {
    var obj = {}

    obj['#'] = ''
    if (attributes) {
      var keys = Object.keys(attributes)
      if (keys.length) {
        obj['@'] = keys.reduce(function (map, key) {
          map[key] = attributes[key]
          return map
        }, {})
      }
    }
    obj['#name'] = name // Need a place to store the node name.
    stack.push(obj)
  })

  // Element ended, clean up.
  this.saxParser.on('endElement', function (name) {
    var obj = stack.pop()
    var nodeName = obj['#name']
    var s = stack[stack.length - 1]
    var old

    delete obj['#name']

    // Remove the '#' key altogether if it's blank.
    if (obj['#'].match(/^\s*$/)) {
      delete obj['#']
    } else {
      // Turn 2 or more spaces into one space.
      obj['#'] = obj['#'].replace(/\s{2,}/g, ' ').trim()

      // Also do away with '#' key altogether, if there's no subkeys
      // unless EXPLICIT_CHARKEY is set.
      if (Object.keys(obj).length === 1 && '#' in obj && !that.EXPLICIT_CHARKEY) {
        obj = obj['#']
      }
    }

    // Set up the parent element relationship.
    if (stack.length > 0) {
      if (!(nodeName in s)) {
        s[nodeName] = obj
      } else if (s[nodeName] instanceof Array) {
        s[nodeName].push(obj)
      } else {
        old = s[nodeName]
        s[nodeName] = [old]
        s[nodeName].push(obj)
      }
    } else {
      that.emit('end', obj)
      that.emit('close')
    }
  })

  // New text element.
  this.saxParser.on('text', function (text) {
    var s = stack[stack.length - 1]
    if (s) {
      s['#'] += text
    }
  })

  this.saxParser.on('error', this.emit.bind(this, 'error'))

  // Stream API
  this.writable = true
  this.readable = true
}
util.inherits(Parser, stream.Stream)

/**
 * Parse an XML in a String or Buffer.
 *
 * @param data {String|Buffer}
 *   The XML data to be parsed.
 * @param isFinal
 *   Informs the parser that this is the last piece of the document.
 *
 * @returns {Boolean}
 *   Returns false if there was a parse error.
 */
Parser.prototype.parse = proxy('parse')
Parser.prototype.parseString = proxy('parse')

/**
 * Sets the encoding to be used to parse the document.
 *
 * Encoding cannot be changed while parsing is in progress.
 *
 * Built in encodings are:
 *   - UTF-8
 *   - UTF-16
 *   - ISO-8859-1
 *   - US-ASCII
 *
 * @param encoding {String}
 *   The encoding to be used.
 *
 * @returns {Boolean}
 *   Returns false if there was an error changing the encoding.
 */
Parser.prototype.setEncoding = proxy('setEncoding')

/**
 * Fetches the current error in a String.
 *
 * If no error happened prior to calling `getError`, null is returned.
 *
 * @returns {String}
 *   Current error.
 */
Parser.prototype.getError = proxy('getError')

/**
 * Stream API
 */
Parser.prototype.write = proxy('write')
Parser.prototype.resume = proxy('resume')
Parser.prototype.pause = proxy('pause')
Parser.prototype.end = proxy('end')
Parser.prototype.stop = proxy('stop')
Parser.prototype.destroy = proxy('destroy')
Parser.prototype.reset = proxy('reset')

function proxy (method) {
  return function () {
    return this.saxParser[method].apply(this.saxParser, arguments)
  }
}

exports.Parser = Parser
