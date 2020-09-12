export {
  on_pop_state,
  on_push_state,
  push_state,
  replace_state,
};

/* global window */

const push_state_subscriptions = new Set();

function run_queue(queue, ...parameters) {
  for (const callback of queue) {
    callback(...parameters);
  }
}

//#region Public API

function on_push_state(callback) {
  push_state_subscriptions.add(callback);

  return function unsubscribe() {
    push_state_subscriptions.delete(callback);
  };
}

function on_pop_state(callback) {
  window.onpopstate = callback;
}

function push_state(path) {
  window.history.pushState(null, '', path);
  run_queue(push_state_subscriptions, path);
}

function replace_state(path) {
  window.history.replaceState(null, '', path);
}

//#endregion
