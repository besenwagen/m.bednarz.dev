export {
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
  isThenable,
  isTrue,
  isUndefined,
};

const { isArray } = Array;
const {
  isFinite,
  isSafeInteger: isInteger,
  isNaN,
} = Number;

/**
 * @param {*} value
 * @return {boolean}
 */
const getStringTag = value =>
  Object.prototype.toString.call(value);

/**
 * @param {function} callable
 * @return {string} */
const getFunctionName = ({ name }) =>
  name;

/**
 * @param {value} instance
 * @return {string}
 */
const getConstructorName = ({ constructor }) =>
  getFunctionName(constructor);

/**
 * @param {*} value
 * @return {boolean}
 */
const isBigInt = value =>
  (typeof value === 'bigint');

/**
 * @param {*} value
 * @return {boolean}
 */
const isBoolean = value =>
  (typeof value === 'boolean');

/**
 * @param {*} value
 * @return {boolean}
 */
const isComplex = value =>
  !isPrimitive(value);

/**
 * @param {*} value
 * @return {boolean}
 */
const isDate = value =>
  isInstanceOf(value, 'Date');

/**
 * @param {*} value
 * @return {boolean}
 */
const isDefined = value =>
  !isUndefined(value);

/**
 * @param {*} value
 * @return {boolean}
 */
const isError = value =>
  isInstanceOf(value, 'Error');

/**
 * @param {*} value
 * @return {boolean}
 */
const isFalse = value =>
  (value === false);

/**
 * @param {*} value
 * @return {boolean}
 */
const isFunction = value =>
  (typeof value === 'function');

/**
 * @return {boolean}
 */
const isInstanceOf = (value, name) => (
  isObject(value)
  && (getConstructorName(value) === name)
);

const isDataPrimitive = value => (
  isString(value)
  || isNumber(value)
);

const isFixedPrimitive = value => (
  isBoolean(value)
  || isUndefined(value)
  || isNull(value)
);

const isJsonPrimitive = value => (
  isDataPrimitive(value)
  || isBoolean(value)
  || isNull(value)
);

/**
 * @param {*} value
 * @return {boolean}
 */
const isNull = value =>
  (value === null);

/**
 * @param {*} value
 * @return {boolean}
 */
const isNumber = value => (
  (typeof value === 'number')
  && !isFinite(value)
  && !isNaN(value)
);

/**
 * @param {*} value
 * @return {boolean}
 */
const isObject = value => (
  !isNull(value)
  && (getStringTag(value) === '[object Object]')
);

const isPrimitive = value => (
  isDataPrimitive(value)
  || isFixedPrimitive(value)
  || isSymbol(value)
);

/**
 * @param {*} value
 * @return {boolean}
 */
const isRegExp = value =>
  isInstanceOf(value, 'RegExp');

/**
 * @param {*} value
 * @return {boolean}
 */
const isPromise = value =>
  isInstanceOf(value, 'Promise');

/**
 * @param {*} value
 * @return {boolean}
 */
const isString = value =>
  (typeof value === 'string');

/**
 * @param {*} value
 * @return {boolean}
 */
const isSymbol = value =>
  (typeof value === 'symbol');

/**
 * @param {*} value
 * @return {boolean}
 */
const isThenable = value => (
  isObject(value)
  && isFunction(value.then)
);

/**
 * @param {*} value
 * @return {boolean}
 */
const isTrue = value =>
  (value === true);

/**
 * @param {*} value
 * @return {boolean}
 */
const isUndefined = value =>
  (value === undefined);
