export {
  insist,
};

/* global window */

function insist(message) {
  function executor(resolve) {
    const result = window.confirm(message);

    resolve(result);
  }

  return new Promise(executor);
}
