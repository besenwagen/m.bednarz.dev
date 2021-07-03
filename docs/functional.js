/**
 * Copyright 2019, 2020 Eric Bednarz <https://m.bednarz.dev>
 * SPDX-License-Identifier: EUPL-1.2
 */
export {
  compose,
  partial,
  pipe,
};

const pass_through = (current_value, transform) =>
  transform(current_value);

const compose = (...transformers) =>
  initial_value =>
    transformers
      .reduceRight(pass_through, initial_value);

const pipe = (...transformers) =>
  initial_value =>
    transformers
      .reduce(pass_through, initial_value);

const partial = (callback, ...head) =>
  (...tail) =>
    callback(...head, ...tail);
