export {
  publish,
  subscribe,
};

/* global document */

const { parse, stringify } = JSON;
const context = document.createDocumentFragment();

/**
 * @param {string} name
 * @param {Object} detail
 */
function publish(name, detail) {
  context.dispatchEvent(new CustomEvent(name, {
    detail,
  }));
}

/**
 * @param {string} name
 * @param {Function} callback
 * @returns {Function}
 */
function subscribe(name, callback) {
  function onDispatch({ detail }) {
    callback(parse(stringify(detail)));
  }

  context.addEventListener(name, onDispatch);

  return function unsubscribe() {
    context.removeEventListener(name, onDispatch);
  };
}
