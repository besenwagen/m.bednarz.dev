/**
 * Copyright 2019, 2020 Eric Bednarz <https://m.bednarz.dev>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
export {
  normalize,
  serialize,
};

import {
  is_array,
  is_json_primitive,
  is_object,
} from './introspection.js';

const { stringify } = JSON;
const { create, keys } = Object;

const copy_array = array => array.map(normalize);

function copy_object(object) {
  const root = create(null);

  for (const key of keys(object).sort()) {
    root[key] = normalize(object[key]);
  }

  return root;
}

function copy_complex_type(value) {
  if (is_array(value)) {
    return copy_array(value);
  }

  if (is_object(value)) {
    return copy_object(value);
  }

  throw new TypeError('unsupported type');
}

function normalize(value) {
  if (is_json_primitive(value)) {
    return value;
  }

  return copy_complex_type(value);
}

const serialize = value =>
  stringify(normalize(value));
