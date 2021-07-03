/**
 * Copyright 2020 Eric Bednarz <https://m.bednarz.dev>
 * SPDX-License-Identifier: EUPL-1.2
 */
export {
  hook,
  use_state,
};

const store = new WeakMap();
const callstack = [];
const ARRAY_EMPTY = 0;

function create_state(context) {
  const state = [];

  store.set(context, state);

  return state;
}

function get_state() {
  const [context] = callstack;

  if (store.has(context)) {
    return store.get(context);
  }

  return create_state(context);
}

const is_state_hook = call =>
  call === use_state;

const get_current_state_index = () =>
  callstack
    .filter(is_state_hook)
    .length;

function initialize(initial_state) {
  const [
    state,
    current_index,
    [update],
  ] = [get_state(), get_current_state_index(), callstack];

  if (state.length === current_index) {
    state.push(initial_state);
  }

  return {
    get() {
      return state[current_index];
    },
    set(next_state) {
      state[current_index] = next_state;
      update();
    },
  };
}

function use_state(initial_state) {
  const { get, set } = initialize(initial_state);

  callstack.push(use_state);

  return [get(), set];
}

function hook(callback, update) {
  return function with_hook(...argument_list) {
    callstack.push(update);

    const return_value = callback(...argument_list);

    callstack.length = ARRAY_EMPTY;

    return return_value;
  };
}
