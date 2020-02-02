export {
  result,
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
      .then(syncResult =>
        overloadSync(syncResult));
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
  const [booleanResult, info] = testResult;
  const message = `${subject}${printInfo(info)}`;

  console.assert(booleanResult, message);
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
 * @param {Object|string} id
 * @returns {Array}
 */
function testFactory(id) {
  const identifier = getModuleIdentifier(id);
  const queue = [];

  /**
   * @param {string} label
   * @param {boolean|function|Array|Promise} testCase
   * @returns {function}
   */
  function run(label, testCase) {
    const onResolved = resultFactory(identifier, label);
    const testPromise = asPromise(testCase).then(onResolved);

    queue.push(testPromise);

    return run;
  }

  /**
   * @param {function} functionUnderTest
   * @returns {function}
   */
  function scope(functionUnderTest) {
    const { name } = functionUnderTest;

    function scopedTest(label, testCase) {
      const scopedLabel = `${name}(): ${label}`;

      run(scopedLabel, testCase);

      return scopedTest;
    }

    return scopedTest;
  }

  return [identifier, queue, run, scope];
}

/**
 * @param {Object|string} id
 * @returns {function}
 */
function suite(id) {
  const [identifier, queue, run, scope] = testFactory(id);

  function overload(...argumentList) {
    const [first] = argumentList;

    if (typeof first === 'function') {
      return scope(first);
    }

    return run(...argumentList);
  }

  registry.set(overload, [identifier, queue]);

  return overload;
}

// == Default export handler ==

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
const filterResults = ([, booleanResult]) =>
  !booleanResult;

/**
 * @param {function} testFunction
 *   the function returned by `suite`
 * @returns {Promise<Array>}
 */
function result(testFunction) {
  /**
   * @param {Array} tuple
   * @returns {Promise}
   */
  const resolve = ([identifier, queue]) =>
    Promise
      .all([identifier, ...queue]);

  /**
   * @param {Array} testSuiteReport
   * @returns {Array}
   */
  function onQueueResolved([identifier, ...testSuiteReport]) {
    const { length: total } = testSuiteReport;
    const { length: errors } = testSuiteReport.filter(filterResults);

    console.info(`${identifier}:`, getSummary(total, errors));

    return [identifier, testSuiteReport, total, errors];
  }

  return Promise
    .resolve(registry.get(testFunction))
    .then(resolve)
    .then(onQueueResolved);
}
