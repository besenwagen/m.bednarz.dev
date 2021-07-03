/**
 * Copyright 2020 Eric Bednarz <https://m.bednarz.dev>
 * SPDX-License-Identifier: EUPL-1.2
 */
export {
  strategy,
};

const { isArray } = Array;
const { getOwnPropertyNames } = Object;

const INDEX_EXPRESSION = /^(?:0|[1-9]\d*)$/;

const is_own_property = (collection, key) =>
  getOwnPropertyNames(collection)
    .includes(key);

const is_array_index = (collection, key) =>
  INDEX_EXPRESSION.test(key)
  && is_own_property(collection, String(key));

function overload(value) {
  if (typeof value === 'function') {
    return value();
  }

  return value;
}

function resolve(validate, collection, key) {
  if (validate(collection, key)) {
    return collection[key];
  }
}

const use_array = (...rest) =>
  resolve(is_array_index, ...rest);

const use_object = (...rest) =>
  resolve(is_own_property, ...rest);

function strategy(collection, default_value) {
  const lookup = isArray(collection) ?
    use_array
    : use_object;

  return key =>
    overload(
      lookup(collection, key)
      || default_value
    );
}
