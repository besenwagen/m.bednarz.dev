export {
  normalize,
  serialize,
};

import {
  isArray,
  isJsonPrimitive,
  isObject,
} from './introspection.js';

const { stringify } = JSON;
const { keys } = Object;

function copyArray(array) {
  const root = [];

  for (const value of array) {
    root.push(normalize(value));
  }

  return root;
}

function copyObject(object) {
  const root = {};
  const sortedKeys = keys(object).sort();

  for (const key of sortedKeys) {
    root[key] = normalize(object[key]);
  }

  return root;
}

function copyComplexType(value) {
  if (isArray(value)) {
    return copyArray(value);
  }

  if (isObject(value)) {
    return copyObject(value);
  }

  throw new TypeError('unsupported type');
}

function normalize(value) {
  if (isJsonPrimitive(value)) {
    return value;
  }

  return copyComplexType(value);
}

const serialize = value =>
  stringify(normalize(value));
