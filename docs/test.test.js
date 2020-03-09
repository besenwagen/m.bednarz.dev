import {
  result, suite,
  _forceUrl as forceUrl,
  _formatAssertionTuple as formatAssertionTuple,
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
  ('enforce https: or file: protocol', () => {
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

test(formatAssertionTuple)
  ('null', [
    formatAssertionTuple(
      ['null', null],
      ['null', null],
    ),
    `
!   [actual] (null) null
! [expected] (null) null`,
  ])
  ('undefined', [
    formatAssertionTuple(
      ['undefined', undefined],
      ['undefined', undefined],
    ),
    `
!   [actual] (undefined) undefined
! [expected] (undefined) undefined`,
  ])
  ('true', [
    formatAssertionTuple(
      ['boolean', true],
      ['boolean', true],
    ),
    `
!   [actual] (boolean) true
! [expected] (boolean) true`,
  ])
  ('false', [
    formatAssertionTuple(
      ['boolean', false],
      ['boolean', false],
    ),
    `
!   [actual] (boolean) false
! [expected] (boolean) false`,
  ])
  ('string', [
    formatAssertionTuple(
      ['string', 'foo bar'],
      ['string', 'foo bar'],
    ),
    `
!   [actual] (string) \\foo bar\\
! [expected] (string) \\foo bar\\`,
  ])
  ('multiline string', [
    formatAssertionTuple(
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
