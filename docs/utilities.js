/**
 * Copyright 2019, 2020 Eric Bednarz <https://m.bednarz.dev>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
export {
  as_array,
  call_or_nothing_at_all,
  concat,
  remove_from_array,
  unique,
  sequence,
};

const { isArray: is_array } = Array;

function call_or_nothing_at_all(condition, [handler, argument_list]) {
  if (condition) {
    return handler(...argument_list);
  }
}

function as_array(value) {
  if (is_array(value)) {
    return value;
  }

  return [value];
}

function remove_from_array(array, item) {
  const length = 1;
  const start = array.indexOf(item);

  array.splice(start, length);

  return array;
}

const concat = (...sub_strings) =>
  sub_strings.join('');

function sequence() {
  const queue = new Set();

  return function pause(resolve, side_effect) {
    /* eslint max-statements: [error, 6] */
    function resume(value) {
      side_effect(value);
      queue.delete(resolve);

      return value;
    }

    function on_error(reason) {
      console.error(reason);
      queue.delete(resolve);
    }

    function with_queue() {
      queue.add(resolve);

      return resolve()
        .then(resume)
        .catch(on_error);
    }

    if (!queue.has(resolve)) {
      return with_queue(resolve, side_effect);
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

const to_sub_total = (total, value) => (total + value);

const add = (...operands) =>
  operands
    .reduce(to_sub_total, INITIAL_SUM);

const random_integer = () =>
  Number(String(random()).slice(RANDOM_OFFSET));

const unique = (prefix = '') =>
  prefix
  + add(
    random_integer(),
    Date.now()
  )
    .toString(ID_BASE)
    .substring(FIRST_INDEX, ID_LENGTH);

//#endregion
