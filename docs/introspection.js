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

const getStringTag = value =>
  Object.prototype.toString.call(value);

const getFunctionName = ({ name }) =>
  name;

const getConstructorName = ({ constructor }) =>
  getFunctionName(constructor);

const isBoolean = value =>
  (typeof value === 'boolean');

const isComplex = value =>
  !isPrimitive(value);

const isDate = value =>
  isInstanceOf(value, Date);

const isDefined = value =>
  !isUndefined(value);

const isError = value =>
  isInstanceOf(value, Error);

const isFalse = value =>
  (value === false);

const isFunction = value =>
  (typeof value === 'function');

const isInstanceOf = (value, constructor) =>
  (value instanceof constructor);

const isInteger = value =>
  isSafeInteger(value);

const isDataPrimitive = value => (
  isString(value)
  || isNumber(value)
);

const isFixedPrimitive = value => (
  isBoolean(value)
  || isNull(value)
  || isUndefined(value)
);

const isJsonPrimitive = value => (
  isDataPrimitive(value)
  || isBoolean(value)
  || isNull(value)
);

const isNull = value =>
  (value === null);

const isNumber = value => (
  (typeof value === 'number')
  && isFinite(value)
  && !isNaN(value)
);

const isObject = value => (
  !isNull(value)
  && (getStringTag(value) === '[object Object]')
);

const isPrimitive = value => (
  isDataPrimitive(value)
  || isFixedPrimitive(value)
  || isSymbol(value)
);

const isRegExp = value =>
  isInstanceOf(value, RegExp);

const isPromise = value =>
  isInstanceOf(value, Promise);

const isString = value =>
  (typeof value === 'string');

const isSymbol = value =>
  (typeof value === 'symbol');

const isThenable = value => (
  isObject(value)
  && isFunction(value.then)
);

const isTrue = value =>
  (value === true);

const isUndefined = value =>
  (value === undefined);
