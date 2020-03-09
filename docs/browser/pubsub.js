/**
 * Copyright 2015, 2020 Eric Bednarz <https://m.bednarz.dev>
 * SPDX-License-Identifier: AGPL-3.0-or-later
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
  function onDispatch({ detail }) {
    callback(parse(stringify(detail)));
  }

  context.addEventListener(name, onDispatch);

  return function unsubscribe() {
    context.removeEventListener(name, onDispatch);
  };
}
