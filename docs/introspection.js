/**
 * Copyright 2019, 2020 Eric Bednarz <https://m.bednarz.dev>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
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
  isNotNull,
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

const stringTagExpression = /^\[object ([^\]]+)\]$/;

const toObjectString = value =>
  Object.prototype.toString.call(value);

function getStringTag(value) {
  const objectString = toObjectString(value);
  const [, stringTag] = stringTagExpression.exec(objectString);

  return stringTag;
}

const getFunctionName = ({ name }) =>
  name;

const getConstructorName = ({ constructor }) =>
  getFunctionName(constructor);

//#region isPrimitive

const isUndefined = value =>
  (value === undefined);

const isNull = value =>
  (value === null);

const isBoolean = value =>
  (typeof value === 'boolean');

const isTrue = value =>
  (value === true);

const isFalse = value =>
  (value === false);

const isString = value =>
  (typeof value === 'string');

const isNumber = value => (
  (typeof value === 'number')
  && isFinite(value)
  && !isNaN(value)
);

const isInteger = value =>
  isSafeInteger(value);

const isSymbol = value =>
  (typeof value === 'symbol');

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

const isPrimitive = value => (
  isDataPrimitive(value)
  || isFixedPrimitive(value)
  || isSymbol(value)
);

//#endregion

const isDefined = value =>
  !isUndefined(value);

const isNotNull = value =>
  !isNull(value);

const isComplex = value =>
  !isPrimitive(value);

const isDate = value =>
  isInstanceOf(value, Date);

const isError = value =>
  isInstanceOf(value, Error);

const isFunction = value =>
  (typeof value === 'function');

const isInstanceOf = (value, constructor) =>
  (value instanceof constructor);

const isObject = value => (
  !isNull(value)
  && (getStringTag(value) === 'Object')
);

const isRegExp = value =>
  isInstanceOf(value, RegExp);

const isPromise = value =>
  isInstanceOf(value, Promise);

const isThenable = value => (
  isObject(value)
  && isFunction(value.then)
);
