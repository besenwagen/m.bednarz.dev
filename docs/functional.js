/**
 * Copyright 2019, 2020 Eric Bednarz <https://m.bednarz.dev>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
export {
  compose,
  partial,
  pipe,
  stage,
};

const passValueTo = (currentValue, transform) =>
  transform(currentValue);

const compose = (...transformers) =>
  initialValue =>
    transformers
      .reduceRight(passValueTo, initialValue);

const pipe = (...transformers) =>
  initialValue =>
    transformers
      .reduce(passValueTo, initialValue);

const stage = callback =>
  boundArgument =>
    callback.bind(null, boundArgument);

const partial = (callback, ...head) =>
  (...tail) =>
    callback(...head, ...tail);
