import {
  result, suite,
  forceUrl,
} from './test.js'

const test = suite(import.meta)

export default result(test)

test
  ('expression', void 0 === undefined)

test
  ('array', [void 0, undefined])

test
  ('promise -> expression',
    new Promise(resolve => {
      setTimeout(() => resolve(void 0 === undefined), 10)
    }))

test
  ('promise -> array',
    new Promise(resolve => {
      setTimeout(() => resolve([void 0, undefined]), 10)
    }))

test
  ('function -> expression',
    () => {
      return void 0 === undefined
    })

test
  ('function -> array',
    () => {
      return [void 0, undefined]
    })

test
  ('function -> promise -> expression',
    () => {
      return new Promise(resolve => {
        setTimeout(() => resolve(void 0 === undefined), 10)
      })
    })

test
  ('function -> promise -> array',
    () => {
      return new Promise(resolve => {
        setTimeout(() => resolve([void 0, undefined]), 10)
      })
    })

test
  ('description is sanitized',
    () => {
      const localTest = suite('SELFTEST')

      localTest(`   foo
         bar   \t   \n       baz
      `, true)

      const onTestResolved = ([, [[sanitized]]]) => [
        sanitized,
        'foo bar baz',
      ]

      return result(localTest).then(onTestResolved)
    })

test(forceUrl)
  ('absolute URL', [
    forceUrl('https://example.org/foo/bar.js'),
    'foo/bar.js',
  ])
  ('absolute path', [
    forceUrl('/foo/bar.js'),
    'foo/bar.js',
  ])
  ('relative path', [
    forceUrl('foo/bar.js'),
    'foo/bar.js',
  ])

  ('only https: or file:', () => {
    try {
      forceUrl('http://example.org/foo/bar.js');

      return false;
    } catch ({ message }) {
      return [
        message,
        "Expected 'https:' or 'file:' protocol, got 'http:'",
      ];
    }
  })
