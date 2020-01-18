export {
  insist,
};

/* global window */

/**
 * Promise API for `window.confirm`.
 * @param {string} message
 * @return {Promise<boolean>}
 */
function insist(message) {
  function executor(resolve) {
    const result = window.confirm(message);

    resolve(result);
  }

  return new Promise(executor);
}
