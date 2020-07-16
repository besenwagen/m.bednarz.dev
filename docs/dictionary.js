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
  freeze,
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

const dictionary = data =>
  freeze(assign(blueprint(), data));
