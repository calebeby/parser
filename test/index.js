const parser = require('..')
const util = require('util')
const test = require('ava')

test('basic', (t) => {
  const str = '<p class="wow">hello world</p>'
  return parser(str).then((out) => {
    t.truthy(out[0].type === 'tag')
    t.truthy(out[0].name === 'p')
    t.truthy(out[0].attrs.class[0].type === 'text')
    t.truthy(out[0].attrs.class[0].content === 'wow')
    t.truthy(out[0].attrs.class[0].location.line === 1)
    t.truthy(out[0].attrs.class[0].location.col === 4)
    t.truthy(out[0].location.line === 1)
    t.truthy(out[0].location.col === 1)
  })
})

test('head/body', (t) => {
  const str = '<!doctype html><html><head><link rel="stylesheet" href="/style.css"></head><body><p>hi!</p></body></html>'
  return parser(str).then((out) => {
    t.truthy(out[0].type === 'text')
    t.truthy(out[0].content.match(/!DOCTYPE/))
    t.truthy(out[1].name === 'html')
    t.truthy(out[1].content[0].name === 'head')
    t.truthy(out[1].content[0].content[0].name === 'link')
    t.truthy(out[1].content[1].name === 'body')
    t.truthy(out[1].content[1].content[0].name === 'p')
  })
})

test('text', (t) => {
  const str = 'hi there'
  return parser(str).then((out) => {
    t.truthy(out[0].type === 'text')
    t.truthy(out[0].content === 'hi there')
    t.truthy(out[0].location.line === 1)
    t.truthy(out[0].location.col === 1)
  })
})

test('tag', (t) => {
  const str = '<p>hi</p>'
  return parser(str).then((out) => {
    t.truthy(out[0].type === 'tag')
    t.truthy(out[0].content[0].type === 'text')
    t.truthy(out[0].content[0].content === 'hi')
    t.truthy(out[0].content[0].location.line === 1)
    t.truthy(out[0].content[0].location.col === 4)
    t.truthy(out[0].location.line === 1)
    t.truthy(out[0].location.col === 1)
  })
})

test('comment', (t) => {
  const str = '<!-- hi -->'
  return parser(str).then((out) => {
    t.truthy(out[0].type === 'comment')
    t.truthy(out[0].content === ' hi ')
    t.truthy(out[0].location.line === 1)
    t.truthy(out[0].location.col === 1)
  })
})

test('nesting', (t) => {
  const str = '<l1><l2><l3>3text</l3>2text</l2></l1>'
  return parser(str).then((out) => {
    t.truthy(out[0].name === 'l1')
    t.truthy(out[0].content[0].name === 'l2')
    t.truthy(out[0].content[0].content[0].name === 'l3')
    t.truthy(out[0].content[0].content[0].content[0].content === '3text')
    t.truthy(out[0].content[0].content[1].content === '2text')
  })
})

test('attributes', (t) => {
  const str = '<p id="wow" class="wow bow" data-foo="bar" @snap="crackle">hi</p>'
  return parser(str).then((out) => {
    t.truthy(out[0].attrs.id[0].content === 'wow')
    t.truthy(out[0].attrs.class[0].content === 'wow bow')
    t.truthy(out[0].attrs['data-foo'][0].content === 'bar')
    t.truthy(out[0].attrs['@snap'][0].content === 'crackle')
  })
})

// parse5 ignores second copies of any attribute
test('multiple matching attributes', (t) => {
  const str = '<p class="one" class="two">hi</p>'
  return parser(str).then((out) => {
    t.truthy(Object.keys(out[0].attrs).length === 1)
    t.truthy(out[0].attrs.class[0].content === 'one')
  })
})

test('boolean attributes', (t) => {
  const str = '<input type="checkbox" selected>hi</input>'
  return parser(str).then((out) => {
    t.truthy(out[0].attrs.type[0].content === 'checkbox')
    t.truthy(out[0].attrs.selected[0].content === '')
  })
})

test('filename option', (t) => {
  const str = '<p class="foo">hello</p>'
  return parser(str, { filename: 'index.html' }).then((out) => {
    t.truthy(out[0].attrs.class[0].location.filename === 'index.html')
    t.truthy(out[0].location.filename === 'index.html')
  })
})

function inspect (tree) { // eslint-disable-line
  console.log(util.inspect(tree, { depth: null, showHidden: true }))
}
