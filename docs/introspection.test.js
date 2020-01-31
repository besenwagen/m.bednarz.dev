import { promise, scope, suite } from './test.js';
import {
  getConstructorName,
  getFunctionName,
  getStringTag,
  isArray,
  isBigInt,
  isBoolean,
  isComplex,
  isDate,
  isDefined,
  isError,
  isFalse,
  isFinite,
  isFunction,
  isInstanceOf,
  isInteger,
  isDataPrimitive,
  isJsonPrimitive,
  isNaN,
  isNull,
  isNumber,
  isObject,
  isPrimitive,
  isPromise,
  isRegExp,
  isSymbol,
  isThenable,
  isTrue,
  isUndefined,
} from './introspection.js';

const test = suite(import.meta);
const assert = scope.bind(null, test);

assert(getConstructorName)
  ('promise instance', [
    getConstructorName(new Promise(() => null)),
    'Promise',
  ])
  ;

assert(getFunctionName)
  ('declaration', [
    getFunctionName(function foo() { }),
    'foo',
  ])
  ;

assert(getStringTag)
  ('object', [
    getStringTag({}),
    '[object Object]',
  ])
  ('array', [
    getStringTag([]),
    '[object Array]',
  ])
  ('function', [
    getStringTag(() => null),
    '[object Function]',
  ])
  ;

assert(isArray)
  ('array literal is true', isArray([]))
  ('array constructor is true', isArray(new Array()))
  ;

assert(isBigInt)
  ('bigint literal is true', isBigInt(42n))
  ('bigint is true', isBigInt(BigInt(42)))
  ('number is false', [isBigInt(42), false])
  ;

assert(isBoolean)
  ('boolean true is true', isBoolean(true))
  ('boolean false is true', isBoolean(false))
  ;

assert(isComplex)
  ('function is true', isComplex(() => null))
  ('object is true', isComplex({}))
  ('array is true', isComplex([]))
  ('date is true', isComplex(new Date()))
  ('null is false', [isComplex(null), false])
  ;

assert(isDataPrimitive)
  ('string is true', isDataPrimitive(''))
  ('number is true', isDataPrimitive(0))
  ('null is false', [isDataPrimitive(null), false])
  ('undefined is false', [isDataPrimitive(undefined), false])
  ('true is false', [isDataPrimitive(true), false])
  ('false is false', [isDataPrimitive(false), false])
  ;

assert(isDate)
  ('date instance is true', isDate(new Date()))
  ;

assert(isDefined)
  ('empty string is true', isDefined(''))
  ('0 is true', isDefined(0))
  ('null is true', isDefined(null))
  ('undefined is false', [isDefined(undefined), false])
  ;

assert(isError)
  ('error is true', isError(new Error()))
  ('type error is true', isError(new TypeError()))
  ;

assert(isFalse)
  ('false is true', isFalse(false))
  ('true is false', [isFalse(true), false])
  ;

assert(isFinite)
  ('number input', isFinite(42))
  ('does not coerce', [isFinite('42'), false])
  ;

assert(isFunction)
  ('function is true', isFunction(() => null))
  ;

assert(isInstanceOf)
  ('data instance', isInstanceOf(new Date(), Date))
  ;

assert(isInteger)
  ('integer is true', isInteger(42))
  ('float is false', [isInteger(42.1), false])
  ('numeric string is false', [isInteger('42'), false])
  ;

assert(isJsonPrimitive)
  ('string', isJsonPrimitive('Hello, world!'))
  ('number', isJsonPrimitive(42))
  ('true', isJsonPrimitive(true))
  ('false', isJsonPrimitive(false))
  ('null', isJsonPrimitive(null))
  ;

assert(isNaN)
  ('input', isNaN(NaN))
  ('does not coerce', [isNaN('42'), false])
  ;

assert(isNull)
  ('null is true', isNull(null))
  ('string is false', [isNull('null'), false])
  ('undefined is false', [isNull(undefined), false])
  ;

assert(isNumber)
  ('number is true', isNumber(42))
  ('NaN is false', [isNumber(NaN), false])
  ('inifinity is false', [isNumber(Infinity), false])
  ;

assert(isObject)
  ('null is false', [isObject(null), false])
  ('array is false', [isObject([]), false])
  ('function is false', [isObject(() => null), false])
  ('true without prototype', isObject(Object.create(null)))
  ;

assert(isPrimitive)
  ('string is true', isPrimitive(''))
  ('number is true', isPrimitive(0))
  ('true is true', isPrimitive(true))
  ('false is true', isPrimitive(false))
  ('null is true', isPrimitive(undefined))
  ('undefined is true', isPrimitive(null))
  ('symbol is true', isPrimitive(Symbol('foobar')))
  ;

assert(isPromise)
  ('promise instance is true', isPromise(new Promise(() => null)))
  ;

assert(isRegExp)
  ('regexp literal is true', isRegExp(/^fubar/))
  ('regexp instance is true', isRegExp(new RegExp('^fubar')))
  ;

assert(isSymbol)
  ('symbol is true', isSymbol(Symbol('foobar')))
  ;

assert(isThenable)
  ('must be a method', isThenable({
    then() {},
  }))
  ('can not be a property', [
    isThenable({
      then: '',
    }),
    false,
  ])
  ;

assert(isTrue)
  ('boolean true is true', isTrue(true))
  ('string true is false', [isTrue('true'), false])
  ;

assert(isUndefined)
  ('undefined is true', isUndefined(undefined))
  ('string undefined is false', [isUndefined('undefined'), false])
  ('null is false', [isUndefined(null), false])
  ;

export default promise(test);
