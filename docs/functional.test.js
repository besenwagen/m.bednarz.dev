import { result, suite } from './test.js'
import {
  compose,
  pipe,
  stage,
  partial,
} from './functional.js'

const test = suite(import.meta)

export default result(test)

const add = value1 =>
  value2 =>
    value1 + value2

const multiply = value1 =>
  value2 =>
    value1 * value2

test(compose)
  ('pass right to left', () => {
    const doTheMath = compose(
      add(6),
      multiply(3)
    )
    return [doTheMath(12), 42]
  })

test(pipe)
  ('pass left to right', () => {
    const doTheMath = pipe(
      multiply(3),
      add(6)
    )
    return [doTheMath(12), 42]
  })

test(stage)
  ('create a transformer with a bound argument', () => {
    const callback = (first, second) => (first + second)
    const callbackSpy = new Proxy(callback, {
      apply(target, thisArg, [a, b]) {
        return (
          (a === 40)
          && (b === 2)
          && (target(a, b) === 42)
        )
      },
    })
    return stage(callbackSpy)(40)(2)
  })

test(partial)
  ('bind single argument', () => {
    const multiply = (a, b) => a * b
    const takeFive = partial(multiply, 5)
    return [
      takeFive(3),
      15,
    ]
  })
  ('bind nultiple arguments', () => {
    const greet = (greeting, firstName, lastName, punctuation) =>
      `${greeting}, ${firstName} ${lastName}${punctuation}`
    const greetJohn = partial(greet, 'Hello', 'John')
    return [
      greetJohn('Doe', '!'),
      'Hello, John Doe!',
    ]
  })
