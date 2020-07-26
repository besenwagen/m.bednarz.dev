/**
 * Copyright 2020 Eric Bednarz <https://m.bednarz.dev>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
export {
  memory,
  network,
  resource,
};

import { storage_context } from './storage.js';

const { sign } = Math;
const { isSafeInteger } = Number;
const { entries } = Object;
const DEFAULT_LIFESPAN = 3600;
const POSITIVE_SIGN = 1;

const is_positive_number = value =>
  sign(value) === POSITIVE_SIGN;

const is_positive_integer = value =>
  is_positive_number(value)
  && isSafeInteger(value);

const is_callable = value =>
  typeof value === 'function';

function overload_with_callable(value, argument_list) {
  if (is_callable(value)) {
    return value(...argument_list);
  }

  return value;
}

const in_memory_store = new Map();

function memory(object) {
  function to_symbols(accumulator, [name, value]) {
    const key = Symbol(name);

    in_memory_store.set(key, value);
    accumulator.push(key);

    return accumulator;
  }

  return entries(object).reduce(to_symbols, []);
}

const network_resolution_store = new Map();

function network(object) {
  function to_symbols(accumulator, [name, value]) {
    const key = Symbol(name);

    network_resolution_store.set(key, value);
    accumulator.push(key);

    return accumulator;
  }

  return entries(object).reduce(to_symbols, []);
}

const with_network = ([callback, argument_list]) =>
  callback(...argument_list);

function with_storage(call_descriptor, transform, lifespan) {
  function with_fallback(stored) {
    if (stored) {
      return stored;
    }

    return with_network(call_descriptor)
      .then(function on_resolved(response_value) {
        const transformed = transform(response_value);

        write(url, transformed);

        return transformed;
      });
  }

  const [read, write] = storage_context();
  const [, [url]] = call_descriptor;

  return Promise
    .resolve(read(url, lifespan))
    .then(with_fallback);
}

function normalize_overloaded(candidates) {
  const [
    transform = value => value,
  ] = candidates.filter(is_callable);
  const [
    lifespan = DEFAULT_LIFESPAN,
  ] = candidates.filter(is_positive_integer);

  return [transform, lifespan];
}

function strategy([callback_descriptor, ...overloaded]) {
  const [transform, lifespan] = normalize_overloaded(overloaded);

  if (lifespan) {
    return with_storage(callback_descriptor, transform, lifespan);
  }

  const on_resolved = response_value =>
    transform(response_value);

  return with_network(callback_descriptor)
    .then(on_resolved);
}

function get_resource_descriptor(id, query) {
  const descriptor = network_resolution_store.get(id);

  return overload_with_callable(descriptor, query);
}

function error(id) {
  if (typeof id === 'symbol') {
    return new Error(`Unknown resource: ${String(id)}`);
  }

  return new TypeError('Resource identifier must be a symbol');
}

function resource(id, ...query) {
  if (in_memory_store.has(id)) {
    return overload_with_callable(in_memory_store.get(id), query);
  }

  if (network_resolution_store.has(id)) {
    return strategy(get_resource_descriptor(id, query));
  }

  return Promise.reject(error(id));
}
