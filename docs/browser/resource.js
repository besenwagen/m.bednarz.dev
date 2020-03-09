/**
 * Copyright 2020 Eric Bednarz <https://m.bednarz.dev>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
export {
  memory,
  network,
  resource,
};

import { storageContext } from './storage.js';

const { sign } = Math;
const { isSafeInteger } = Number;
const { entries } = Object;
const DEFAULT_LIFESPAN = 3600;
const POSITIVE_SIGN = 1;

const isPositiveNumber = value =>
  sign(value) === POSITIVE_SIGN;

const isPositiveInteger = value =>
  isPositiveNumber(value)
  && isSafeInteger(value);

const isCallable = value =>
  typeof value === 'function';

function overloadWithCallable(value, argumentList) {
  if (isCallable(value)) {
    return value(...argumentList);
  }

  return value;
}

const inMemoryStore = new Map();

function memory(object) {
  function toSymbols(accumulator, [name, value]) {
    const key = Symbol(name);

    inMemoryStore.set(key, value);
    accumulator.push(key);

    return accumulator;
  }

  return entries(object).reduce(toSymbols, []);
}

const networkResolutionStore = new Map();

function network(object) {
  function toSymbols(accumulator, [name, value]) {
    const key = Symbol(name);

    networkResolutionStore.set(key, value);
    accumulator.push(key);

    return accumulator;
  }

  return entries(object).reduce(toSymbols, []);
}

const withNetwork = ([callback, argumentList]) =>
  callback(...argumentList);

function withStorage(callDescriptor, transform, lifespan) {
  function withFallback(stored) {
    if (stored) {
      return stored;
    }

    return withNetwork(callDescriptor)
      .then(function onResolved(responseValue) {
        const transformed = transform(responseValue);

        write(url, transformed);

        return transformed;
      });
  }

  const [read, write] = storageContext();
  const [, [url]] = callDescriptor;

  return Promise
    .resolve(read(url, lifespan))
    .then(withFallback);
}

function normalizeOverloaded(candidates) {
  const [
    transform = value => value,
  ] = candidates.filter(isCallable);
  const [
    lifespan = DEFAULT_LIFESPAN,
  ] = candidates.filter(isPositiveInteger);

  return [transform, lifespan];
}

function strategy([callbackDescriptor, ...overloaded]) {
  const [transform, lifespan] = normalizeOverloaded(overloaded);

  if (lifespan) {
    return withStorage(callbackDescriptor, transform, lifespan);
  }

  const onResolved = responseValue =>
    transform(responseValue);

  return withNetwork(callbackDescriptor)
    .then(onResolved);
}

function getResourceDescriptor(id, query) {
  const descriptor = networkResolutionStore.get(id);

  return overloadWithCallable(descriptor, query);
}

function error(id) {
  if (typeof id === 'symbol') {
    return new Error(`Unknown resource: ${String(id)}`);
  }

  return new TypeError('Resource identifier must be a symbol');
}

function resource(id, ...query) {
  if (inMemoryStore.has(id)) {
    return overloadWithCallable(inMemoryStore.get(id), query);
  }

  if (networkResolutionStore.has(id)) {
    return strategy(getResourceDescriptor(id, query));
  }

  return Promise.reject(error(id));
}
