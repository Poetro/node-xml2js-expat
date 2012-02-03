var expat = require('node-expat'),
    util = require('util'),
    events = require('events');

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
  var that = this,
      stack = [],
      defaultEncoding = 'UTF-8';

  if (typeof encoding === 'function') {
    callback = encoding;
    encoding = defaultEncoding;
  }
  // Make the sax parser.
  this.saxParser = new expat.Parser(encoding || defaultEncoding);
  // Always use the '#' key, even if there are no subkeys.
  this.EXPLICIT_CHARKEY = false;
  this.resultObject = null;

  if (callback) {
    this.on('end', callback);
  }

  // New  element arrived handle it.
  this.saxParser.on('startElement', function (name, attributes) {
    var obj = {}, keys;

    obj['#'] = "";
    if (attributes) {
      keys = Object.keys(attributes);
      keys.forEach(function (k) {
        var v = attributes[k];
        if (typeof obj['@'] === 'undefined') {
          obj['@'] = {};
        }
        obj['@'][k] = v;
      });
    }
    obj['#name'] = name; // Need a place to store the node name.
    stack.push(obj);
  });

  // Element ended, clean up.
  this.saxParser.on('endElement', function (name) {
    var obj = stack.pop(),
        nodeName = obj['#name'],
        s = stack[stack.length - 1],
        old;

    delete obj['#name'];

    // Remove the '#' key altogether if it's blank.
    if (obj['#'].match(/^\s*$/)) {
      delete obj['#'];
    } else {
      // Turn 2 or more spaces into one space.
      obj['#'] = obj['#'].replace(/\s{2,}/g, " ").trim();

      // Also do away with '#' key altogether, if there's no subkeys
      // unless EXPLICIT_CHARKEY is set.
      if (Object.keys(obj).length === 1 && '#' in obj && !that.EXPLICIT_CHARKEY) {
        obj = obj['#'];
      }
    }

    // Set up the parent element relationship.
    if (stack.length > 0) {
      if (typeof s[nodeName] === 'undefined') {
        s[nodeName] = obj;
      }
      else if (s[nodeName] instanceof Array) {
        s[nodeName].push(obj);
      }
      else {
        old = s[nodeName];
        s[nodeName] = [old];
        s[nodeName].push(obj);
      }
    } else {
      that.resultObject = obj;
      that.emit("end", that.resultObject, that.getError());
    }
  });

  // New text element.
  this.saxParser.addListener('text', function (text) {
    var s = stack[stack.length - 1];
    if (s) {
      s['#'] += text;
    }
  });
};
util.inherits(Parser, events.EventEmitter);

/**
 * Parse an XML in a String or Buffer.
 *
 * @param data {String} or {Buffer}
 *   The XML data to be parsed.
 * @param isFinal
 *   Informs the parser that this is the last piece of the document.
 *
 * @returns {Boolean}
 *   Returns false if there was a parse error.
 */
Parser.prototype.parse = function (data, isFinal) {
  return this.saxParser.parse(data, isFinal);
};

/**
 * Parse an XML string.
 *
 * @param string {String}
 *   The XML data to be parsed.
 * @param isFinal
 *   Informs the parser that this is the last piece of the document.
 *
 * @returns {Boolean}
 *   Returns false if there was a parse error.
 */
Parser.prototype.parseString = function (string, isFinal) {
  return this.saxParser.parse(string.toString(), isFinal);
};

/**
 * Parse an XML string.
 *
 * @param buffer {Buffer}
 *   The XML data to be parsed.
 * @param isFinal
 *   Informs the parser that this is the last piece of the document.
 *
 * @returns {Boolean}
 *   Returns false if there was a parse error.
 */
Parser.prototype.parseBuffer = function (buffer, isFinal) {
  return this.saxParser.parse(buffer, isFinal);
};

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
Parser.prototype.setEncoding = function (encoding) {
  return this.saxParser.setEncoding(encoding);
};

/**
 * Fetches the current error in a String.
 *
 * If no error happened prior to calling `getError`, null is returned.
 *
 * @returns {String}
 *   Current error.
 */
Parser.prototype.getError = function () {
  return this.saxParser.getError();
};

exports.Parser = Parser;
