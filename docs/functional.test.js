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
  const addFive = partial(add, 5)
  const timesThree = partial(multiply, 3)

  const greet = (greeting, firstName, lastName, punctuation) =>
    `${greeting}, ${firstName} ${lastName}${punctuation}`
  const greetJohn = partial(greet, 'Hello', 'John')

  test(partial)
    ('apply a single argument', [
      addFive(3),
      8,
    ])
    ('apply multiple arguments', [
      greetJohn('Doe', '!'),
      'Hello, John Doe!',
    ])

  test(pipe)
    ('reduce from left to right', [
      pipe(addFive, timesThree)(2),
      21,
    ])
  test(compose)
    ('reduce from right to left', [
      compose(addFive, timesThree)(2),
      11,
    ])

  test('compose and pipe have an inverse relationship', [
    compose(timesThree, addFive)(7),
    pipe(addFive, timesThree)(7),
  ])
}
