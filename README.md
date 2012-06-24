node-xml2js-expat
==

Description
--
Simple XML to JavaScript object converter.  Uses [node-expat](https://github.com/astro/node-expat).  Install with [npm](http://github.com/isaacs/npm) :)
See the tests for examples until docs are written.
Note:  If you're looking for a full DOM parser, you probably want [JSDom](http://github.com/tmpvar/jsdom).

Simple usage
--

    var util = require('util'),
        fs = require('fs'),
        xml2js = require('xml2js-expat');

    var parser = new xml2js.Parser(function(result, error) {
        if (!error) {
            console.log(util.inspect(result));
        }
        else {
            console.error(error);
        }
        console.log('Done.');
    });
    fs.readFile(__dirname + '/foo.xml', function(err, data) {
        if (parser.parseString(data)) {
          console.log('xml2js: successfully parsed file.');
        }
        else {
          console.error('xml2js: parse error: "%s"', parser.getError());
        }
    });

The Parser object has an event, that can be suscribed to with

    parser.on('end', function (result, error) {});
    // or
    parser.addListener('end', function (result, error) {});

The Parser object supports the following encodings, that can be specified as the first parameter, in which case the callback should be the second. (Each argument is optional.)

  - `UTF-8`
  - `UTF-16`
  - `ISO-8859-1`
  - `US-ASCII`

For example:

    var parser = new xml2js.Parser('UTF-8', function(result, error) {});

or

    var parser = new xml2js.Parser('UTF-8');
    parser.on('end', function (result, error) {});
