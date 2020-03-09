/**
 * Copyright 2020 Eric Bednarz <https://m.bednarz.dev>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
export {
  storageContext,
};

import { milli } from '../math.js';

/* global localStorage */

const { now } = Date;
const { parse, stringify } = JSON;

const secondsElapsed = timestamp =>
  milli(now() - timestamp);

function freshValue([timestamp, value], maxage) {
  if (secondsElapsed(timestamp) < maxage) {
    return value;
  }

  return null;
}

const withTimestamp = data => stringify([
  now(),
  data,
]);

const context = new WeakMap();

/* eslint-disable */
function createContextApi(storage) {
  function read(key, maxage) {
    const item = parse(storage.getItem(key));

    if (item === null) {
      return item;
    }

    return freshValue(item, maxage);
  }

  function write(key, value) {
    const item = withTimestamp(value);

    storage.setItem(key, item);
  }

  const contextApi = [read, write];

  context.set(storage, contextApi);

  return contextApi;
}

function storageContext(storage = localStorage) {
  if (context.has(storage)) {
    return context.get(storage);
  }

  return createContextApi(storage);
}
