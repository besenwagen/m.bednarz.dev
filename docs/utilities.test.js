import { result, suite } from './test.js'
import {
  as_array,
  call_or_nothing_at_all,
  unique,
} from './utilities.js'

const test = suite(import.meta)

export default result(test)

test(call_or_nothing_at_all)
  ('falsy -> undefined', [
    call_or_nothing_at_all(false, [n => n + 1, [41]]),
    undefined,
  ])
  ('truthy -> return value', [
    call_or_nothing_at_all(true, [n => n + 1, [41]]),
    42,
  ])

test(as_array)
  ('return the argument if it is an array', () => {
    const my_array = []
    return (as_array(my_array) === my_array)
  })
  ('wrap other values in an array', () => {
    const my_value = 'Hello, world!'
    return [
      JSON.stringify(as_array(my_value)),
      '["Hello, world!"]',
    ]
  })

test(unique)
  ('create identifier', (unique() !== unique()))
  ('limit length', [unique().length, 8])
