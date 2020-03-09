/**
 * Copyright 2019, 2020 Eric Bednarz <https://m.bednarz.dev>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
export {
  dictionary,
};

const {
  assign,
  create,
  defineProperty,
  defineProperties,
  entries,
} = Object;

const stringTagDescriptor = {
  value: 'Dictionary',
};

const blueprint = () =>
  defineProperty(
    create(null),
    Symbol.toStringTag,
    stringTagDescriptor
  );

const toDescriptor = (accumulator, [key, value]) =>
  assign(accumulator, {
    [key]: {
      enumerable: true,
      value,
    },
  });

const dictionary = descriptor =>
  defineProperties(
    blueprint(),
    entries(descriptor)
      .reduce(toDescriptor, {})
  );
