export {
  promise,
  scope,
  suite,
};

const { isArray } = Array;

const registry = new WeakMap();
const testPrimitiveExpression = /^(?:string|number|boolean)$/;
const PREFIX_INVALID = 'Invalid test case:';
const PATH_OFFSET = 1;
const ORDERED_PAIR_LENGTH = 2;

/**
 * @param {*} value
 * @returns {boolean}
 */
const isImportMeta = value => (
  (Object
    .prototype
    .toString
    .call(value) === '[object Object]')
  && (typeof value.url === 'string')
);

/**
 * @param {*} value
 * @returns {boolean}
 */
const isOrderedPair = value => (
  isArray(value)
  && (value.length === ORDERED_PAIR_LENGTH)
);

const isTestPrimitive = value => (
  testPrimitiveExpression.test(typeof value)
  || value === null
  || value === undefined
);

function forcePrimitives(orderedPair) {
  if (orderedPair.every(isTestPrimitive)) {
    return orderedPair;
  }

  throw new TypeError([
    PREFIX_INVALID,
    'ordered pair values must be',
    [
      'string',
      'number',
      'boolean',
      'null',
    ].join(', '),
    'or undefined',
  ].join(' '));
}

/**
 * @param {string|number|null|undefined} value
 * @returns {string}
 */
const withTypeInfo = value =>
  `(${typeof value}) ${value}`;

/**
 * @param {Array} orderedPair
 * @returns {Array}
 */
function isOrderedPairEqual(orderedPair) {
  const [actual, expected] = forcePrimitives(orderedPair);

  if (actual === expected) {
    return [true];
  }

  return [false, [actual, expected].map(withTypeInfo)];
}

/**
 * @param {Object|string} value
 * @returns {string}
 */
function overloadIdentifier(value) {
  if (isImportMeta(value)) {
    return getRelativePath(value.url);
  }

  return value;
}

/**
 * Get the current working directory for removing it
 * from the file:// URL paths in Deno and Node.js.
 *
 * @todo Make this module completely environment agnostic.
 *
 * @returns {string}
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
 * @returns {string}
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
 * @returns {string}
 */
function getRelativePath(url) {
  const { pathname } = new URL(url);

  return normalizePath(pathname);
}

/**
 * @param {Object|string} value
 * @returns {string}
 */
function getModuleIdentifier(value) {
  const identifier = overloadIdentifier(value);

  return identifier;
}

/**
 * @param {boolean|function|Array|Promise} value
 * @returns {boolean|Array|Promise}
 */
function overloadCallable(value) {
  if (typeof value === 'function') {
    return value();
  }

  return value;
}

/**
 * @param {boolean} value
 * @returns {Array}
 */
function forceBoolean(value) {
  if (typeof value === 'boolean') {
    return [value];
  }

  throw new TypeError([
    PREFIX_INVALID,
    'test case must resolve a boolean',
  ].join(' '));
}

/**
 * @param {boolean|Array}
 * @returns {Array}
 */
function overloadSync(value) {
  if (isOrderedPair(value)) {
    return isOrderedPairEqual(value);
  }

  return forceBoolean(value);
}

/**
 * @param {boolean|function|Array|Promise} value
 * @returns {Promise<boolean>}
 */
function asPromise(value) {
  const normalized = overloadCallable(value);

  if (normalized.constructor === Promise) {
    return normalized
      .then(result =>
        overloadSync(result));
  }

  return Promise
    .resolve(overloadSync(normalized));
}

/**
 * @param {Array} [info]
 * @returns {string}
 */
function printInfo(info) {
  if (info) {
    const [actual, expected] = info;

    return [
      `\n| expected: ${expected}`,
      `\n|   actual: ${actual}`,
    ].join('');
  }

  return '';
}

/**
 * @param {Array} testResult
 * @param {string} subject
 */
function assert(testResult, subject) {
  const [result, info] = testResult;
  const message = `${subject}${printInfo(info)}`;

  console.assert(result, message);
}

/**
 * @param {string} id
 * @param {string} label
 * @returns {function}
 */
const resultFactory = (id, label) =>
  /**
   * @param {Array} testResult
   * @returns {Array}
   */
  function onTestResultResolved(testResult) {
    const message = [id, label].join(' > ');

    assert(testResult, message);

    return [label, ...testResult];
  };

/**
 * @param {Object|string} identifier
 * @returns {Object}
 */
function suite(identifier) {
  const moduleIdentifier = getModuleIdentifier(identifier);
  const testQueue = [];

  /**
   * @param {string} label
   * @param {boolean|function|Array|Promise} testCase
   */
  function test(label, testCase) {
    const onResolved = resultFactory(moduleIdentifier, label);
    const testPromise = asPromise(testCase).then(onResolved);

    testQueue.push(testPromise);

    return test;
  }

  registry.set(test, [moduleIdentifier, testQueue]);

  return test;
}

/**
 * @param {function} testFunction
 * @param {function} functionUnderTest
 * @returns {function}
 */
function scope(testFunction, functionUnderTest) {
  const { name } = functionUnderTest;

  /**
   * @param {string} label
   * @param {boolean|function|Array|Promise} testCase
   */
  function boundTest(label, testCase) {
    const prefixedLabel = `${name}(): ${label}`;

    testFunction(prefixedLabel, testCase);

    return boundTest;
  }

  return boundTest;
}

//==========================================================
// Default export Promise
//==========================================================

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
 * @returns {Promise<Array>}
 */
function promise(testFunction) {
  const [identifier, queue] = registry.get(testFunction);

  /**
   * @param {Array} testSuiteReport
   * @returns {Array}
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
