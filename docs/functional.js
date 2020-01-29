export {
  compose,
  pipe,
  stage,
};

/**
 * Reducer function for `compose`/`pipe`.
 * @param {*} currentValue
 * @param {function} transform
 * @returns {*}
 */
const passValueTo = (currentValue, transform) =>
  transform(currentValue);

/**
 * Create a multi-stage transformer function
 * (right to left / inside out).
 * @param {...function} transformers
 *   list of transformers created with `stage`
 * @returns {function}
 *   returns the result of passing its parameter
 *   sequentially through all transformers
 */
const compose = (...transformers) =>
  initialValue =>
    transformers
      .reduceRight(passValueTo, initialValue);

/**
 * Create a multi-stage transformer function
 * (left to right / outside in).
 * @param {...function} transformers
 *   list of transformers created with `stage`
 * @returns {function}
 *   returns the result of passing its parameter
 *   sequentially through all transformers
 */
const pipe = (...transformers) =>
  initialValue =>
    transformers
      .reduce(passValueTo, initialValue);

/**
 * Create a `compose`/`pipe` stage.
 * @param {function} callback
 *   produces the input for the next stage by using
 *   the bound value of the current stage and the
 *   output of the previous stage as parameters
 * @returns {function}
 *   binds its argument to `callback` and
 *   returns the actual transformer that is
 *   called by the `compose`/`pipe` reducer
 */
const stage = callback =>
  boundArgument =>
    callback.bind(null, boundArgument);
