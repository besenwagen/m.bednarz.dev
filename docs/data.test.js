import { result, suite } from './test.js'
import { normalize, serialize } from './data.js'

const test = suite(import.meta)

export default result(test)

// JSON primitives

test(normalize)
  ('string', [normalize('Hello, world!'), 'Hello, world!'])
  ('number', [normalize(42), 42])
  ('true', normalize(true))
  ('false', [normalize(false), false])
  ('null', [normalize(null), null])

// JSON structures

test(serialize)
  ('array', [
    serialize(['foo', 42, null]),
    '["foo",42,null]',
  ])
  ('object', [
    serialize({
      z: 42,
      a: [
        {
          x: 'foo',
          c: 7,
        },
        false,
      ],
      n: null,
    }),
    '{"a":[{"c":7,"x":"foo"},false],"n":null,"z":42}',
  ])
