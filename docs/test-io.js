export {
  load,
  objectify,
};

// Environment agnostic test automation I/O utilities

//==========================================================
// Input
//==========================================================

const INITIAL_COUNT = 0;
const TOTAL_INDEX = 2;
const ERROR_INDEX = 3;

/**
 * @param {Module} module
 * @returns {Promise}
 */
const getDefaultModule = module =>
  module.default;

/**
 * @param {string} path
 * @returns {Promise}
 */
const loadModule = path =>
  import(path)
    .then(getDefaultModule);

const reduceCount = (subTotal, value) =>
  subTotal + value;

const reduceIndex = (array, index) =>
  array
    .map(tuple => tuple[index])
    .reduce(reduceCount, INITIAL_COUNT);

function withStats(result) {
  const { length: moduleCount } = result;
  const testCount = reduceIndex(result, TOTAL_INDEX);
  const errorCount = reduceIndex(result, ERROR_INDEX);

  return [
    result,
    [moduleCount, testCount, errorCount],
  ];
}

/**
 * @param {Array} queue
 *   a list of test module URLs
 * @returns {Promise<Object>}
 */
function load(queue) {
  const modules = queue.map(loadModule);

  return Promise
    .all(modules)
    .then(withStats);
}

//==========================================================
// Output
//==========================================================

const { fromEntries } = Object;

/**
 * @param {Array} entry
 * @returns {Array}
 */
const toSuite = ([key, value]) =>
  [key, fromEntries(value)];

/**
 * @param {Array} result
 * @returns {Object}
 */
const objectify = result =>
  fromEntries(result.map(toSuite));
