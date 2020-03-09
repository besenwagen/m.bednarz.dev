import { result, suite } from './test.js'
import { dictionary } from './dictionary.js'

const test = suite(import.meta)

export default result(test)

test
  ('the stringTag of a dictionary is Dictionary', [
    Object
      .prototype
      .toString
      .call(dictionary({})),
    '[object Dictionary]',
  ])
  ('a dictionary has no constructor', [
    dictionary({}).constructor,
    undefined,
  ])
  ('a dictionary has no prototype', [
    dictionary({}).prototype,
    undefined,
  ])
