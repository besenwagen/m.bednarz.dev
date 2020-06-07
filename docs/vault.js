/**
 * Copyright 2020 Eric Bednarz <https://m.bednarz.dev>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
export {
  get,
  set,
  unset,
  decrement,
  increment,
  Vault,
};

const INCREMENT = 1;
const vault = new WeakMap();

function onDemand(instance) {
  if (!vault.has(instance)) {
    vault.set(instance, new Map());
  }

  return vault.get(instance);
}

const get = (instance, key) =>
  vault
    .get(instance)
    .get(key);

const set = (instance, ...rest) =>
  onDemand(instance)
    .set(...rest);

const unset = (instance, key) =>
  vault
    .get(instance)
    .delete(key);

function increment(instance, key, value = INCREMENT) {
  const index = get(instance, key);

  set(instance, key, (index + value));
}

function decrement(instance, key, value = INCREMENT) {
  const index = get(instance, key);

  set(instance, key, (index - value));
}

const ON_DEMAND = Symbol('onDemand');

class Vault {
  constructor() {
    this.vault = new WeakMap();
  }

  get(instance, key) {
    return this.vault
      .get(instance)
      .get(key);
  }

  set(instance, ...rest) {
    this[ON_DEMAND](instance)
      .set(...rest);
  }

  unset(instance, key) {
    this.vault
      .get(instance)
      .delete(key);
  }

  [ON_DEMAND](instance) {
    if (!this.vault.has(instance)) {
      this.vault.set(instance, new Map());
    }

    return this.vault.get(instance);
  }
}
