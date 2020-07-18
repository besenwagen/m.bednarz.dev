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
  entries,
  fromEntries,
  freeze,
} = Object;

const isString = ([name]) =>
  typeof name === 'string';

const filter = object =>
  fromEntries(
    entries(object)
      .filter(isString)
  );

const dictionary = data =>
  freeze(assign(create(null), filter(data)));
