export {
  callOrNothingAtAll,
};

/**
 * @param {*} condition
 * @param {Array} tuple
 * @returns {*}
 */
function callOrNothingAtAll(condition, [handler, argumentList]) {
  if (condition) {
    return handler(...argumentList);
  }
}
