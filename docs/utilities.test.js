import { result, suite } from './test.js'
import {
  asArray,
  callOrNothingAtAll,
  unique,
} from './utilities.js'

const test = suite(import.meta)

export default result(test)

{
  const test_callOrNothingAtAll = test(callOrNothingAtAll)
  const increment = n => n + 1

  test_callOrNothingAtAll
    ('falsy -> undefined', [
      callOrNothingAtAll(0, [
        increment, [
          41,
        ]]),
      undefined,
    ])

  test_callOrNothingAtAll
    ('truthy -> return value', [
      callOrNothingAtAll(1, [
        increment, [
          41,
        ]]),
      42,
    ])
}

test(asArray)
  ('return the argument if it is an array', () => {
    const myArray = []

    return (asArray(myArray) === myArray)
  })
  ('wrap other values in an array', () => {
    const myValue = 'Hello, world!'

    return [
      JSON.stringify(asArray(myValue)),
      '["Hello, world!"]',
    ]
  })

test(unique)
  ('create identifier', (unique() !== unique()))
  ('limit length', [unique(6).length, 6])
