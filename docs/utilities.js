/**
 * Copyright 2019, 2020 Eric Bednarz <https://m.bednarz.dev>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
export {
  asArray,
  callOrNothingAtAll,
  concat,
  removeFromArray,
  unique,
  sequence,
};

function callOrNothingAtAll(condition, [handler, argumentList]) {
  if (condition) {
    return handler(...argumentList);
  }
}

const { isArray } = Array;

function asArray(value) {
  if (isArray(value)) {
    return value;
  }

  return [value];
}

function removeFromArray(array, item) {
  const length = 1;
  const start = array.indexOf(item);

  array.splice(start, length);

  return array;
}

const concat = (...subStrings) =>
  subStrings.join('');

function sequence() {
  const queue = new Set();

  return function pause(resolve, sideEffect) {
    /* eslint max-statements: [error, 6] */
    function resume(value) {
      sideEffect(value);
      queue.delete(resolve);

      return value;
    }

    function onError(reason) {
      console.error(reason);
      queue.delete(resolve);
    }

    function withQueue() {
      queue.add(resolve);

      return resolve()
        .then(resume)
        .catch(onError);
    }

    if (!queue.has(resolve)) {
      return withQueue(resolve, sideEffect);
    }

    return Promise.reject();
  };
}

//#region unique

const { random } = Math;

const INITIAL_SUM = 0;
const FIRST_INDEX = 0;
const RANDOM_OFFSET = 2;
const ID_BASE = 36;
const ID_LENGTH = 8;

const toSubTotal = (total, value) => (total + value);

const add = (...operands) =>
  operands
    .reduce(toSubTotal, INITIAL_SUM);

const randomInteger = () =>
  Number(String(random()).slice(RANDOM_OFFSET));

const unique = (prefix = '') =>
  prefix
  + add(
    randomInteger(),
    Date.now()
  )
    .toString(ID_BASE)
    .substring(FIRST_INDEX, ID_LENGTH);

//#endregion
