/**
 * Copyright 2020 Eric Bednarz <https://m.bednarz.dev>
 * SPDX-License-Identifier: EUPL-1.2
 */
export {
  create_store,
};

const { assign, create } = Object;

function create_store() {
  const store = create(null);

  return assign(create(null), {
    get_property(key) {
      return store[key];
    },
    set_property(key, value) {
      const previous = store[key];

      store[key] = value;

      return [value, previous];
    },
    unset_property(key) {
      return delete store[key];
    },
  });
}
