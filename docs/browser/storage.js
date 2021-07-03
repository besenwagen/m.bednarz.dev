/**
 * Copyright 2020 Eric Bednarz <https://m.bednarz.dev>
 * SPDX-License-Identifier: EUPL-1.2
 */
export {
  storage_context,
};

import { milli } from '../math.js';

/* global localStorage */

const { now } = Date;
const { parse, stringify } = JSON;

const seconds_elapsed = timestamp =>
  milli(now() - timestamp);

function fresh_value([timestamp, value], max_age) {
  if (seconds_elapsed(timestamp) < max_age) {
    return value;
  }

  return null;
}

const with_timestamp = data => stringify([
  now(),
  data,
]);

const context = new WeakMap();

/* eslint-disable */
function create_context_api(storage) {
  function read(key, maxage) {
    const item = parse(storage.getItem(key));

    if (item === null) {
      return item;
    }

    return fresh_value(item, maxage);
  }

  function write(key, value) {
    const item = with_timestamp(value);

    storage.setItem(key, item);
  }

  const context_api = [read, write];

  context.set(storage, context_api);

  return context_api;
}

function storage_context(storage = localStorage) {
  if (context.has(storage)) {
    return context.get(storage);
  }

  return create_context_api(storage);
}
