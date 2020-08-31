import {
  result, suite,
  _force_url as force_url,
  _format_assertion_tuple as format_assertion_tuple,
} from './test.js'

const test = suite(import.meta)

export default result(test)

test
  ('expression', void 0 === undefined)
  ('array', [void 0, undefined])
  ('promise -> expression',
    new Promise(resolve => {
      setTimeout(() => resolve(void 0 === undefined), 10)
    }))
  ('promise -> array',
    new Promise(resolve => {
      setTimeout(() => resolve([void 0, undefined]), 10)
    }))
  ('function -> expression', () => {
    return void 0 === undefined
  })
  ('function -> array', () => {
    return [void 0, undefined]
  })
  ('function -> promise -> expression', () => {
    return new Promise(resolve =>
      setTimeout(() =>
        resolve(void 0 === undefined), 10))
  })
  ('function -> promise -> array', () => {
    return new Promise(resolve =>
      setTimeout(() =>
        resolve([void 0, undefined]), 10))
  })
  ('sanitize description', () => {
    const local_test = suite('SELFTEST')
    local_test(`   foo
         bar   \t   \n       baz
      `, true)
    const on_test_resolved = ([, [[sanitized]]]) => [
      sanitized,
      'foo bar baz',
    ]
    return result(local_test).then(on_test_resolved)
  })
  ('NaN', [
    NaN,
    NaN,
  ])

test(force_url)
  ('absolute URL', [
    force_url('https://example.org/foo/bar.js'),
    'foo/bar.js',
  ])
  ('absolute path', [
    force_url('/foo/bar.js'),
    'foo/bar.js',
  ])
  ('relative path', [
    force_url('foo/bar.js'),
    'foo/bar.js',
  ])
  ('enforce https: or file: protocol', () => {
    try {
      force_url('http://example.org/foo/bar.js')
      return false
    } catch ({ message }) {
      return [
        message,
        "Expected 'https:', 'file:' or 'blob:' protocol, got 'http:'",
      ]
    }
  })

test(format_assertion_tuple)
  ('null', [
    format_assertion_tuple(
      ['null', null],
      ['null', null],
    ),
    `
!   [actual] (null) null
! [expected] (null) null`,
  ])
  ('undefined', [
    format_assertion_tuple(
      ['undefined', undefined],
      ['undefined', undefined],
    ),
    `
!   [actual] (undefined) undefined
! [expected] (undefined) undefined`,
  ])
  ('true', [
    format_assertion_tuple(
      ['boolean', true],
      ['boolean', true],
    ),
    `
!   [actual] (boolean) true
! [expected] (boolean) true`,
  ])
  ('false', [
    format_assertion_tuple(
      ['boolean', false],
      ['boolean', false],
    ),
    `
!   [actual] (boolean) false
! [expected] (boolean) false`,
  ])
  ('string', [
    format_assertion_tuple(
      ['string', 'foo bar'],
      ['string', 'foo bar'],
    ),
    `
!   [actual] (string) \\foo bar\\
! [expected] (string) \\foo bar\\`,
  ])
  ('multiline string', [
    format_assertion_tuple(
      ['string', 'foo \n bar'],
      ['string', 'foo \n bar'],
    ),
    `
!   [actual] (string)
!            \\foo \\
!            \\ bar\\
! [expected] (string)
!            \\foo \\
!            \\ bar\\`,
  ])
