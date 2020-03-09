/**
 * Copyright 2020 Eric Bednarz <https://m.bednarz.dev>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
export {
  createStore,
};

const { assign, create } = Object;

function createStore() {
  const store = create(null);

  return assign(create(null), {
    getProperty(key) {
      return store[key];
    },
    setProperty(key, value) {
      const previous = store[key];

      store[key] = value;

      return [value, previous];
    },
    unsetProperty(key) {
      return delete store[key];
    },
  });
}
