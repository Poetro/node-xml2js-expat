node-xml2js-expat
==

Description
--
Simple XML to JavaScript object converter.  Uses [node-expat](https://github.com/astro/node-expat).  Install with [npm](https://github.com/npm/npm) :)
See the tests for examples until docs are written.
Note:  If you're looking for a full DOM parser, you probably want [JSDom](http://github.com/tmpvar/jsdom).

Simple usage
--

```javascript
var fs = require('fs')
var xml2js = require('xml2js-expat')

var parser = new xml2js.Parser();
fs.createReadStream('/path/to/file')
  .pipe(parser)
  .on('error', console.error.bind(console, 'xml2js: parse error:'))
  .on('end', console.log.bind(console, 'xml2js: successfully parsed file:'))
```

The Parser object supports the following encodings, that can be specified as the first parameter, in which case the callback should be the second. (Each argument is optional.)

  - `UTF-8`
  - `UTF-16`
  - `ISO-8859-1`
  - `US-ASCII`

For example:

```javascript
var parser = new xml2js.Parser('UTF-8', function(error, result) {});
```

or

```javascript
var parser = new xml2js.Parser('UTF-8');
parser
  .on('end', function (result) {})
  .on('error', function (error) {});
  .write('<p>data</p>')
```

Parser also supports streaming input:

```javascript
var parser = new xml2js.Parser('UTF-8');
fs.createReadStream('/path/to/file')
  .pipe(parser)
  .on('end', function(result) {})
  .on('error', function(error) {})
```
