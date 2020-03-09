import { result, suite } from './test.js'
import {
  getConstructorName, getFunctionName,
  getStringTag, isArray,
  isBoolean, isComplex, isDate,
  isDataPrimitive, isDefined, isError,
  isFalse, isFinite, isFunction,
  isInstanceOf, isInteger, isJsonPrimitive,
  isNaN, isNull, isNumber, isObject,
  isPrimitive, isPromise, isRegExp,
  isSymbol, isThenable, isTrue, isUndefined,
} from './introspection.js'

const test = suite(import.meta)

export default result(test)

test(getConstructorName)
  ('promise instance', [
    getConstructorName(new Promise(() => null)),
    'Promise',
  ])

test(getFunctionName)
  ('declaration', [
    getFunctionName(function foo() { }),
    'foo',
  ])

test(getStringTag)
  ('object', [getStringTag({}), '[object Object]'])
  ('array', [getStringTag([]), '[object Array]'])
  ('function', [getStringTag(() => null), '[object Function]'])

test(isArray)
  ('array literal', isArray([]))
  ('Array instance', isArray(new Array()))

test(isBoolean)
  ('true', isBoolean(true))
  ('false', isBoolean(false))

test(isComplex)
  ('function', isComplex(() => null))
  ('object', isComplex({}))
  ('array', isComplex([]))
  ('date', isComplex(new Date()))
  ('not null', [isComplex(null), false])

test(isDataPrimitive)
  ('string', isDataPrimitive(''))
  ('number', isDataPrimitive(0))
  ('not null', [isDataPrimitive(null), false])
  ('not undefined', [isDataPrimitive(undefined), false])
  ('not true', [isDataPrimitive(true), false])
  ('not false', [isDataPrimitive(false), false])

test(isDate)
  ('date instance', isDate(new Date()))

test(isDefined)
  ('empty string', isDefined(''))
  ('0', isDefined(0))
  ('null', isDefined(null))
  ('not undefined', [isDefined(undefined), false])

test(isError)
  ('Error instance', isError(new Error()))
  ('TypeError instance', isError(new TypeError()))

test(isFalse)
  ('false', isFalse(false))
  ('not true', [isFalse(true), false])

test(isFinite)
  ('number input', isFinite(42))
  ('does not coerce', [isFinite('42'), false])

test(isFunction)
  ('arrow function', isFunction(() => null))

test(isInstanceOf)
  ('error instance', isInstanceOf(new TypeError(), Error))

test(isInteger)
  ('integer', isInteger(42))
  ('not float', [isInteger(42.1), false])
  ('not numeric string', [isInteger('42'), false])

test(isJsonPrimitive)
  ('string', isJsonPrimitive('Hello, world!'))
  ('number', isJsonPrimitive(42))
  ('true', isJsonPrimitive(true))
  ('false', isJsonPrimitive(false))
  ('null', isJsonPrimitive(null))

test(isNaN)
  ('input', isNaN(NaN))
  ('does not coerce', [isNaN('42'), false])

test(isNull)
  ('null', isNull(null))
  ('not string', [isNull('null'), false])
  ('not undefined', [isNull(undefined), false])

test(isNumber)
  ('number', isNumber(42))
  ('not NaN', [isNumber(NaN), false])
  ('not inifinity', [isNumber(Infinity), false])

test(isObject)
  ('not null', [isObject(null), false])
  ('not array', [isObject([]), false])
  ('not function', [isObject(() => null), false])
  ('object without prototype', isObject(Object.create(null)))

test(isPrimitive)
  ('string', isPrimitive(''))
  ('number', isPrimitive(0))
  ('true', isPrimitive(true))
  ('false', isPrimitive(false))
  ('undefined', isPrimitive(undefined))
  ('null', isPrimitive(null))
  ('symbol', isPrimitive(Symbol('foobar')))

test(isPromise)
  ('Promise instance', isPromise(new Promise(() => null)))

test(isRegExp)
  ('regexp literal', isRegExp(/^fubar/))
  ('RegExp instance', isRegExp(new RegExp('^fubar')))

test(isSymbol)
  ('Symbol call', isSymbol(Symbol('foobar')))

test(isThenable)
  ('must be a method', isThenable({ then() { } }))
  ('can not be a property', [isThenable({ then: '' }), false])

test(isTrue)
  ('true', isTrue(true))
  ('not false', [isTrue(false), false])
  ('not string true', [isTrue('true'), false])

test(isUndefined)
  ('undefined', isUndefined(undefined))
  ('not string', [isUndefined('undefined'), false])
  ('not null', [isUndefined(null), false])
