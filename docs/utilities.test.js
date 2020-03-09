import { result, suite } from './test.js'
import {
  asArray,
  callOrNothingAtAll,
  unique,
} from './utilities.js'

const test = suite(import.meta)

export default result(test)

test(callOrNothingAtAll)
  ('falsy -> undefined', [
    callOrNothingAtAll(false, [n => n + 1, [41]]),
    undefined,
  ])
  ('truthy -> return value', [
    callOrNothingAtAll(true, [n => n + 1, [41]]),
    42,
  ])

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
  ('limit length', [unique().length, 8])
