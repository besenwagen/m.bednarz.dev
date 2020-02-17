import { result, suite } from './test.js'
import { callOrNothingAtAll, unique } from './utilities.js'

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

test(unique)
  ('identifier', (unique() !== unique()))
  ('length', [unique(6).length, 6])
