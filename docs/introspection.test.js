import { promise, scope, suite } from './test.js';
import {
  isFalse,
  isFinite,
  isNaN,
  isObject,
} from './introspection.js';

const test = suite(import.meta);

scope(test, isFalse)
  ('false is true', isFalse(false))
  ('true is false', [
    isFalse(true),
    false,
  ])
  ;

scope(test, isFinite)
  ('number input', isFinite(42))
  ('does not coerce', [
    isFinite('42'),
    false,
  ]);

scope(test, isNaN)
  ('input', isNaN(NaN))
  ('does not coerce', [
    isNaN('42'),
    false,
  ]);

scope(test, isObject)
  ('null is false', [
    isObject(null),
    false,
  ])
  ('array is false', [
    isObject([]),
    false,
  ])
  ('function is false', [
    isObject(() => null),
    false,
  ])
  ('true without prototype', isObject(Object.create(null)))
  ;

export default promise(test);
