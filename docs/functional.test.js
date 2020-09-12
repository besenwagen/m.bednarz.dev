import { result, suite } from './test.js'
import {
  compose,
  pipe,
  partial,
} from './functional.js'

const test = suite(import.meta)

export default result(test)

{
  const add = (a, b) => a + b
  const multiply = (a, b) => a * b
  const add_five = partial(add, 5)
  const times_three = partial(multiply, 3)

  const greet = (greeting, first_name, last_name, punctuation) =>
    `${greeting}, ${first_name} ${last_name}${punctuation}`
  const greet_john = partial(greet, 'Hello', 'John')

  test(partial)
    ('apply a single argument', [
      add_five(3),
      8,
    ])
    ('apply multiple arguments', [
      greet_john('Doe', '!'),
      'Hello, John Doe!',
    ])

  test(pipe)
    ('reduce from left to right', [
      pipe(add_five, times_three)(2),
      21,
    ])
  test(compose)
    ('reduce from right to left', [
      compose(add_five, times_three)(2),
      11,
    ])

  test('compose and pipe have an inverse relationship', [
    compose(times_three, add_five)(7),
    pipe(add_five, times_three)(7),
  ])
}
