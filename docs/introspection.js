export {
  getConstructorName,
  getFunctionName,
  getStringTag,
  isArray,
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
};

const { isArray } = Array;
const {
  isFinite,
  isSafeInteger,
  isNaN,
} = Number;

/**
 * @param {*} value
 * @returns {boolean}
 */
const getStringTag = value =>
  Object.prototype.toString.call(value);

/**
 * @param {function} callable
 * @returns {string}
 */
const getFunctionName = ({ name }) =>
  name;

/**
 * @param {value} instance
 * @returns {string}
 */
const getConstructorName = ({ constructor }) =>
  getFunctionName(constructor);

/**
 * @param {*} value
 * @returns {boolean}
 */
const isBoolean = value =>
  (typeof value === 'boolean');

/**
 * @param {*} value
 * @returns {boolean}
 */
const isComplex = value =>
  !isPrimitive(value);

/**
 * @param {*} value
 * @returns {boolean}
 */
const isDate = value =>
  isInstanceOf(value, Date);

/**
 * @param {*} value
 * @returns {boolean}
 */
const isDefined = value =>
  !isUndefined(value);

/**
 * @param {*} value
 * @returns {boolean}
 */
const isError = value =>
  isInstanceOf(value, Error);

/**
 * @param {*} value
 * @returns {boolean}
 */
const isFalse = value =>
  (value === false);

/**
 * @param {*} value
 * @returns {boolean}
 */
const isFunction = value =>
  (typeof value === 'function');

/**
 * @param {*} value
 * @param {function} constructor
 * @returns {boolean}
 */
const isInstanceOf = (value, constructor) =>
  (value instanceof constructor);

/**
 * @param {*} value
 * @returns {boolean}
 */
const isInteger = value =>
  isSafeInteger(value);

/**
 * string or number
 * @param {*} value
 * @retuens {boolean}
 */
const isDataPrimitive = value => (
  isString(value)
  || isNumber(value)
);

/**
 * true, false, null or undefined
 * @param {*} value
 * @returns {boolean}
 */
const isFixedPrimitive = value => (
  isBoolean(value)
  || isNull(value)
  || isUndefined(value)
);

/**
 * string, number, true, false or null
 * @param {*} value
 * @returns {boolean}
 */
const isJsonPrimitive = value => (
  isDataPrimitive(value)
  || isBoolean(value)
  || isNull(value)
);

/**
 * @param {*} value
 * @returns {boolean}
 */
const isNull = value =>
  (value === null);

/**
 * @param {*} value
 * @returns {boolean}
 */
const isNumber = value => (
  (typeof value === 'number')
  && isFinite(value)
  && !isNaN(value)
);

/**
 * @param {*} value
 * @returns {boolean}
 */
const isObject = value => (
  !isNull(value)
  && (getStringTag(value) === '[object Object]')
);

/**
 * string, number, symbol, true, false, null or undefined
 * @param {*} value
 * @returns {boolean}
 */
const isPrimitive = value => (
  isDataPrimitive(value)
  || isFixedPrimitive(value)
  || isSymbol(value)
);

/**
 * @param {*} value
 * @returns {boolean}
 */
const isRegExp = value =>
  isInstanceOf(value, RegExp);

/**
 * @param {*} value
 * @returns {boolean}
 */
const isPromise = value =>
  isInstanceOf(value, Promise);

/**
 * @param {*} value
 * @returns {boolean}
 */
const isString = value =>
  (typeof value === 'string');

/**
 * @param {*} value
 * @returns {boolean}
 */
const isSymbol = value =>
  (typeof value === 'symbol');

/**
 * @param {*} value
 * @returns {boolean}
 */
const isThenable = value => (
  isObject(value)
  && isFunction(value.then)
);

/**
 * @param {*} value
 * @returns {boolean}
 */
const isTrue = value =>
  (value === true);

/**
 * @param {*} value
 * @returns {boolean}
 */
const isUndefined = value =>
  (value === undefined);
