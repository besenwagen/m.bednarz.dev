import { promise, scope, suite } from './test.js';
import {
  compose,
  pipe,
  stage,
} from './functional.js';

const test = suite(import.meta);

const add = value1 =>
  value2 =>
    value1 + value2;

const multiply = value1 =>
  value2 =>
    value1 * value2;

scope(test, compose)

  ('passes right to left',
    () => {
      const doTheMath = compose(
        add(6),
        multiply(3)
      );

      return [doTheMath(12), 42];
    })

  ;

scope(test, pipe)

  ('passes left to right',
    () => {
      const doTheMath = pipe(
        multiply(3),
        add(6)
      );

      return [doTheMath(12), 42];
    })

  ;

scope(test, stage)

  ('creates a transformer with a bound argument',
    () => {
      const callback = (first, second) => (first + second);

      const callbackSpy = new Proxy(callback, {
        apply(target, thisArg, [a, b]) {
          return (
            (a === 40)
            && (b === 2)
            && (target(a, b) === 42)
          );
        },
      });

      return stage(callbackSpy)(40)(2);
    })

  ;

export default promise(test);
