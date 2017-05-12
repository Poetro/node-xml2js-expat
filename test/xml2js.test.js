var xml2js = require('../lib/xml2js')
var fs = require('fs')
var path = require('path')
var tap = require('tap')

tap.test('test default parse', function (assert) {
  var parser = new xml2js.Parser(function (error, r) {
    assert.same(error, null)

    assert.equal(r['chartest']['@']['desc'], 'Test for CHARs')
    assert.equal(r['chartest']['#'], 'Character data here!')
    assert.equal(r['cdatatest']['@']['desc'], 'Test for CDATA')
    assert.equal(r['cdatatest']['@']['misc'], 'true')
    assert.equal(r['cdatatest']['#'], 'CDATA here!')
    assert.equal(r['nochartest']['@']['desc'], 'No data')
    assert.equal(r['nochartest']['@']['misc'], 'false')
    assert.equal(r['listtest']['item'][0]['#'], 'This is character data!')
    assert.equal(r['listtest']['item'][0]['subitem'][0], 'Foo(1)')
    assert.equal(r['listtest']['item'][0]['subitem'][1], 'Foo(2)')
    assert.equal(r['listtest']['item'][0]['subitem'][2], 'Foo(3)')
    assert.equal(r['listtest']['item'][0]['subitem'][3], 'Foo(4)')
    assert.equal(r['listtest']['item'][1], 'Qux.')
    assert.equal(r['listtest']['item'][2], 'Quux.')

    assert.end()
  })

  assert.notStrictEqual(parser, undefined)

  fs.readFile(path.join(__dirname, 'fixtures', 'sample.xml'), function (err, data) {
    assert.strictEqual(err, null)
    parser.parse(data)
  })
})

tap.test('test parse EXPLICIT_CHARKEY', function (assert) {
  var parser = new xml2js.Parser(function (error, r) {
    assert.same(error, null)

    assert.equal(r['chartest']['@']['desc'], 'Test for CHARs')
    assert.equal(r['chartest']['#'], 'Character data here!')
    assert.equal(r['cdatatest']['@']['desc'], 'Test for CDATA')
    assert.equal(r['cdatatest']['@']['misc'], 'true')
    assert.equal(r['cdatatest']['#'], 'CDATA here!')
    assert.equal(r['nochartest']['@']['desc'], 'No data')
    assert.equal(r['nochartest']['@']['misc'], 'false')
    assert.equal(r['listtest']['item'][0]['#'], 'This is character data!')
    assert.equal(r['listtest']['item'][0]['subitem'][0]['#'], 'Foo(1)')
    assert.equal(r['listtest']['item'][0]['subitem'][1]['#'], 'Foo(2)')
    assert.equal(r['listtest']['item'][0]['subitem'][2]['#'], 'Foo(3)')
    assert.equal(r['listtest']['item'][0]['subitem'][3]['#'], 'Foo(4)')
    assert.equal(r['listtest']['item'][1]['#'], 'Qux.')
    assert.equal(r['listtest']['item'][2]['#'], 'Quux.')
    assert.end()
  })

  assert.notStrictEqual(parser, undefined)
  parser.EXPLICIT_CHARKEY = true

  fs.readFile(path.join(__dirname, 'fixtures', 'sample.xml'), function (err, data) {
    assert.strictEqual(err, null)
    parser.parseString(data)
  })
})

tap.test('test parse stream', function (assert) {
  var parser = new xml2js.Parser(function (error, r) {
    assert.same(error, null)
    assert.equal(r['chartest']['@']['desc'], 'Test for CHARs')
    assert.equal(r['chartest']['#'], 'Character data here!')
    assert.equal(r['cdatatest']['@']['desc'], 'Test for CDATA')
    assert.equal(r['cdatatest']['@']['misc'], 'true')
    assert.equal(r['cdatatest']['#'], 'CDATA here!')
    assert.equal(r['nochartest']['@']['desc'], 'No data')
    assert.equal(r['nochartest']['@']['misc'], 'false')
    assert.equal(r['listtest']['item'][0]['#'], 'This is character data!')
    assert.equal(r['listtest']['item'][0]['subitem'][0], 'Foo(1)')
    assert.equal(r['listtest']['item'][0]['subitem'][1], 'Foo(2)')
    assert.equal(r['listtest']['item'][0]['subitem'][2], 'Foo(3)')
    assert.equal(r['listtest']['item'][0]['subitem'][3], 'Foo(4)')
    assert.equal(r['listtest']['item'][1], 'Qux.')
    assert.equal(r['listtest']['item'][2], 'Quux.')

    assert.end()
  })

  assert.notStrictEqual(parser, undefined)

  fs.createReadStream(path.join(__dirname, 'fixtures', 'sample.xml'))
  .pipe(parser)
})

tap.test('test parse error', function (assert) {
  var parser = new xml2js.Parser('UTF-8', function (error, r) {
    assert.equal(error, 'not well-formed (invalid token)')
    assert.end()
  })

  assert.notStrictEqual(parser, undefined)

  parser.write('</end>')
})
