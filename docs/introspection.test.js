import { promise, suite } from './test.js';
import {
  isFalse,
  isFinite,
  isNaN,
  isObject,
} from './introspection.js';

const test = suite(import.meta);

test('isFalse:false is true', isFalse(false));

test('isFalse:true is false', [
  isFalse(true),
  false,
]);

test('isFinite: number input', isFinite(42));

test('isFinite: does not coerce', [
  isFinite('42'),
  false,
]);

test('isNaN input', isNaN(NaN));

test('isNaN does not coerce', [
  isNaN('42'),
  false,
]);

test('isObject:null is false', [
  isObject(null),
  false,
]);

test('isObject:array is false', [
  isObject([]),
  false,
]);

test('isObject:function is false', [
  isObject(() => null),
  false,
]);

test('isObject true without prototype', isObject(Object.create(null)));

export default promise(test);
