export {
  load,
  objectify,
  promise,
  scope,
  suite,
};

const { isArray } = Array;
const { fromEntries } = Object;

const PATH_OFFSET = 1;
const ORDERED_PAIR_LENGTH = 2;
const INITIAL_COUNT = 0;
const TOTAL_INDEX = 2;
const ERROR_INDEX = 3;

/**
 * @param {*} value
 * @return {boolean}
 */
const isBoolean = value =>
  (typeof value === 'boolean');

/**
 * @param {*} value
 * @return {boolean}
 */
const isString = value =>
  (typeof value === 'string');

/**
 * @param {*} value
 * @return {boolean}
 */
const isObject = value => (
  Object
    .prototype
    .toString
    .call(value) === '[object Object]'
);

/**
 * @param {*} value
 * @return {boolean}
 */
const isPromise = value =>
  (value.constructor === Promise);

/**
 * @param {*} value
 * @return {boolean}
 */
const isImportMeta = value => (
  isObject(value)
  && isString(value.url)
);

/**
 * @param {*} value
 * @return {boolean}
 */
const isOrderedPair = value => (
  isArray(value)
  && (value.length === ORDERED_PAIR_LENGTH)
);

/**
 * @param {Array} value
 * @return {boolean}
 */
const isOrderedPairEqual = ([actual, expected]) =>
  (actual === expected);

/**
 * @param {boolean} result
 * @param {string} message
 * @return {boolean}
 */
function validate(result, message) {
  const type = typeof result;

  if (type !== 'boolean') {
    console.error(`${message}: not a boolean`);

    return false;
  }

  return result;
}

/**
 * @param {string} subject
 * @param {string} key
 * @param {boolean} value
 * @return {Array}
 */
function toTestTuple(subject, key, value) {
  const message = [subject, key].join(' > ');
  const result = validate(value, message);

  console.assert(result, message);

  return [key, result];
}

/**
 * @param {Object|string} value
 * @return {string}
 */
function overloadIdentifier(value) {
  if (isImportMeta(value)) {
    return value.url;
  }

  return value;
}

/**
 * Get the current working directory for removing it
 * from the file:// URL paths in Deno and Node.js.
 *
 * @todo Make this module completely environment agnostic.
 *
 * @return {string}
 */
function getEnvironmentPrefix() {
  /* global Deno process */
  if (typeof Deno !== 'undefined') {
    return Deno.cwd();
  }

  if (typeof process !== 'undefined') {
    return process.cwd();
  }

  return '';
}

/**
 * @param {string} pathname
 * @return {string}
 */
function normalizePath(pathname) {
  const prefix = getEnvironmentPrefix();

  if (prefix) {
    const prefixExpression = new RegExp(`^${prefix}/`);

    return pathname.replace(prefixExpression, '');
  }

  return pathname.substring(PATH_OFFSET);
}

/**
 * @param {string} url
 * @return {string}
 */
function getRelativePath(url) {
  const { pathname } = new URL(url);

  return normalizePath(pathname);
}

/**
 * @param {Object|string} value
 * @return {string}
 */
function getModuleIdentifier(value) {
  const url = overloadIdentifier(value);

  return getRelativePath(url);
}

/**
 * @param {boolean|function|Array|Promise} value
 * @return {boolean|Array|Promise}
 */
function overloadCallable(value) {
  if (typeof value === 'function') {
    return value();
  }

  return value;
}

/**
 * @param {boolean|Array}
 * @return {boolean}
 */
function overloadSync(value) {
  if (isOrderedPair(value)) {
    return isOrderedPairEqual(value);
  }

  if (isBoolean(value)) {
    return value;
  }

  throw new TypeError(`bad type: ${value}`);
}

/**
 * @param {boolean|function|Array|Promise} value
 * @return {Promise<boolean>}
 */
function asPromise(value) {
  const normalized = overloadCallable(value);

  if (isPromise(normalized)) {
    return normalized
      .then(result =>
        overloadSync(result));
  }

  return Promise
    .resolve(overloadSync(normalized));
}

/**
 * @param {Object|string} identifier
 * @return {Object}
 */
function suite(identifier) {
  const moduleIdentifier = getModuleIdentifier(identifier);
  const testQueue = [];

  /**
   * @param {string} label
   * @param {boolean|function|Array|Promise} testCase
   */
  function test(label, testCase) {
    const testPromise = asPromise(testCase)
      .then(testResult =>
        toTestTuple(moduleIdentifier, label, testResult));

    testQueue.push(testPromise);

    return test;
  }

  registry.set(test, [moduleIdentifier, testQueue]);

  return test;
}

/**
 * @param {function} testFunction
 * @param {function} functionUnderTest
 * @return {function}
 */
function scope(testFunction, functionUnderTest) {
  const { name } = functionUnderTest;

  function boundTest(label, testCase) {
    testFunction(`${name}(): ${label}`, testCase);

    return boundTest;
  }

  return boundTest;
}

//==========================================================
// Promise
//==========================================================

const registry = new WeakMap();

/**
 * @param {number} total
 * @param {number} errors
 */
function getSummary(total, errors) {
  if (errors) {
    return `${errors} failed, ${total - errors} passed`;
  }

  return `${total} passed`;
}

/**
 * @param {Array} tuple
 */
const filterResults = ([, result]) => !result;

/**
 * @param {function} testFunction
 *   the function returned by `suite`
 * @return {Promise<Array>}
 */
function promise(testFunction) {
  const [identifier, queue] = registry.get(testFunction);

  /**
   * @param {Array} testSuiteReport
   * @return {Array}
   */
  function onQueueResolved(testSuiteReport) {
    const { length: total } = testSuiteReport;
    const { length: errors } = testSuiteReport.filter(filterResults);

    console.info(`${identifier}:`, getSummary(total, errors));

    return [identifier, testSuiteReport, total, errors];
  }

  return Promise
    .all(queue)
    .then(onQueueResolved);
}

//==========================================================
// Load
//==========================================================

/**
 * @param {Module} module
 * @return {Promise}
 */
const getDefaultModule = module =>
  module.default;

/**
 * @param {string} path
 * @return {Promise}
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
 * @return {Promise<Object>}
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

/**
 * @param {Array} entry
 * @return {Array}
 */
const toSuite = ([key, value]) =>
  [key, fromEntries(value)];

/**
 * @param {Array} result
 * @return {Object}
 */
const objectify = result =>
  fromEntries(result.map(toSuite));
