/**
 * Copyright 2015, 2020 Eric Bednarz <https://m.bednarz.dev>
 * SPDX-License-Identifier: EUPL-1.2
 */
export {
  publish,
  subscribe,
};

/* global document CustomEvent */

const { parse, stringify } = JSON;
const context = document.createDocumentFragment();

function publish(name, detail) {
  context.dispatchEvent(new CustomEvent(name, {
    detail,
  }));
}

function subscribe(name, callback) {
  function on_dispatch({ detail }) {
    callback(parse(stringify(detail)));
  }

  context.addEventListener(name, on_dispatch);

  return function unsubscribe() {
    context.removeEventListener(name, on_dispatch);
  };
}
