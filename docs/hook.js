/**
 * Copyright 2020 Eric Bednarz <https://m.bednarz.dev>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
export {
  hook,
  use_state,
};

const store = new WeakMap();
const call_stack = [];
const ARRAY_EMPTY = 0;

function create_state(context) {
  const state = [];

  store.set(context, state);

  return state;
}

function get_state() {
  const [context] = call_stack;

  if (store.has(context)) {
    return store.get(context);
  }

  return create_state(context);
}

const is_state_hook = call =>
  call === use_state;

const get_current_state_index = () =>
  call_stack
    .filter(is_state_hook)
    .length;

function initialize(initial_state) {
  const state = get_state();
  const current_index = get_current_state_index();

  if (state.length === current_index) {
    state.push(initial_state);
  }

  return {
    get() {
      return state[current_index];
    },
    set(next_state) {
      state[current_index] = next_state;

      return next_state;
    },
  };
}

function use_state(initial_state) {
  const { get, set } = initialize(initial_state);

  const set_state = next_state => [
    get(),
    set(next_state),
  ].reverse();

  call_stack.push(use_state);

  return [get(), set_state];
}

const hook = callable =>
  function with_state_hook(...argument_list) {
    call_stack.push(callable);

    const return_value = callable(...argument_list);

    call_stack.length = ARRAY_EMPTY;

    return return_value;
  };
