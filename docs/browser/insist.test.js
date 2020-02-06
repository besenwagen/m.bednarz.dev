import { result, suite } from '../test.js'
import { insist } from './insist.js'

const test = suite(import.meta)

export default result(test)

{
  const { warn } = console

  warn(
    'Calling the `insist` function blocks execution',
    'until user interaction with the browser.'
  )
  warn(
    'Run this test suite in isolation',
    'with the query `?m=insist`.'
  )
}

test(
  'resolves a boolean',
  insist('Are you sure? Your answer does not matter.')
    .then(value =>
      (typeof value === 'boolean')))
