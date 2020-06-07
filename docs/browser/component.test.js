import { result, suite } from '../test.js'
import {
  _conditional as conditional,
} from './component.js'

const test = suite(import.meta)

export default result(test)

test(conditional)
  ('function guard', () => {
    let foo = 0

    function bar(m, n) {
      foo = m * n
    }

    conditional(bar, 4, 3)

    return [
      foo,
      12,
    ]
  })
  ('guarded function falsy', () => {
    let foo = 0

    function bar(m, n) {
      foo = m * n
    }

    conditional(false, bar, 4, 3)

    return [
      foo,
      0,
    ]
  })
  ('guarded function truthy', () => {
    let foo = 0

    function bar(m, n) {
      foo = m * n
    }

    conditional(true, bar, 4, 3)

    return [
      foo,
      12,
    ]
  })
