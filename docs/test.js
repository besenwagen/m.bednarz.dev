export {
  result,
  suite,

  // private
  forceUrl,
};

const { isArray } = Array;

const testPrimitiveExpression = /^(?:string|number|boolean)$/;
const PREFIX_INVALID = 'Invalid test case:';
const ORDERED_PAIR_LENGTH = 2;

//#region module identifier

const BASE_URL = 'https://localhost/';
const PATH_OFFSET = 1;

/**
 * Get the current working directory for removing it
 * from the file:// URL paths in Deno and Node.js.
 *
 * @todo Make this module completely environment agnostic.
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

function forceUrl(value) {
  const {
    pathname,
    protocol,
  } = new URL(value, BASE_URL);

  if (!/^(?:https|file):$/.test(protocol)) {
    throw new Error(
      `Expected 'https:' or 'file:' protocol, got '${protocol}'`
    );
  }

  return normalizePath(pathname);
}

/**
 * @param {Object|string} value
 * @returns {string}
 */
function overloadIdentifier(value) {
  if (isImportMeta(value)) {
    return getRelativePath(value.url);
  }

  return forceUrl(value);
}

//#endregion

//#region assertion

/**
 * @param {Array} tuple
 * @returns {string}
 */
function getAssertionType(value) {
  if (value === null) {
    return String(value);
  }

  return typeof value;
}

/**
 * @param {string} token
 * @param {number} count
 * @returns {string}
 */
const drawTheLine = (token, count) =>
  token.repeat(count);

/**
 * @param {string} value
 * @returns {string}
 */
const newLine = value => `\n${value}`;

/**
 * @param {string} prefix
 * @param {string} value
 * @param {number} length
 * @returns {string}
 */
function formatMultilineAssertion(prefix, value, length) {
  const pipe = '|';
  const tail = value.replace(/\n/gm, newLine(pipe));
  const line = newLine([
    pipe,
    drawTheLine('-', (length - pipe.length)),
  ].join(''));

  return [prefix, line, newLine(`|${tail}`)].join('');
}

/**
 * @param {string} label
 * @param {string} value
 * @param {number} length
 * @returns {string}
 */
function formatAssertion(label, value, length) {
  const type = getAssertionType(value);
  const prefix = newLine(`| ${label} (${type}):`);

  if (type === 'string' && value.includes('\n')) {
    return formatMultilineAssertion(prefix, value, length);
  }

  return `${prefix} ${value}`;
}

/**
 * @param {Array} [info]
 * @returns {string}
 */
const formatAssertionTuple = (actual, expected, length) => [
  newLine(drawTheLine('=', length)),
  formatAssertion('  actual', actual, length),
  newLine(drawTheLine('~', length)),
  formatAssertion('expected', expected, length),
  newLine(drawTheLine('=', length)),
].join('');

/**
 * @param {Array} assertion
 * @param {string} subject
 */
function assert([actual, expected], subject) {
  const pipe = '| ';
  const width = (subject.length + pipe.length);
  const testResult = (actual === expected);

  console.assert(testResult, [
    newLine(drawTheLine('=', width)),
    newLine(pipe),
    subject,
    formatAssertionTuple(actual, expected, width),
  ].join(''));

  return testResult;
}

//#endregion

//#region test case

/**
 * @param {*} value
 * @returns {boolean}
 */
const isTestPrimitive = value => (
  testPrimitiveExpression.test(typeof value)
  || (value === null)
  || (value === undefined)
);

/**
 * @param {Array} orderedPair
 * @returns {Array}
 */
function forceTestPrimitives(orderedPair) {
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
 * @param {boolean} value
 * @returns {Array}
 */
function forceBoolean(value) {
  if (typeof value === 'boolean') {
    return value;
  }

  throw new TypeError([
    PREFIX_INVALID,
    'test case must resolve a boolean',
  ].join(' '));
}

/**
 * @param {*} value
 * @returns {boolean}
 */
const isOrderedPair = value => (
  isArray(value)
  && (value.length === ORDERED_PAIR_LENGTH)
);

/**
 * @param {boolean|Array} value
 * @returns {Array}
 */
function overloadSync(value) {
  if (isOrderedPair(value)) {
    return forceTestPrimitives(value);
  }

  return [forceBoolean(value), true];
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
 * @param {boolean|function|Array|Promise} value
 * @returns {Promise<boolean>}
 */
function overloadPromise(value) {
  const normalized = overloadCallable(value);

  if (normalized.constructor === Promise) {
    return normalized
      .then(syncResult =>
        overloadSync(syncResult));
  }

  return Promise
    .resolve(overloadSync(normalized));
}

//#endregion

const registry = new WeakMap();

//#region test suite

/**
 * @param {string} value
 * @returns {string}
 */
const sanitizeDescription = value =>
  value
    .replace(/\s+/gm, ' ')
    .trim();

/**
 * @param {string} id
 * @param {string} label
 * @returns {function}
 */
const resultFactory = (id, label) =>

  /**
   * @param {Array} assertion
   * @returns {Array}
   */
  function onTestResultResolved(assertion) {
    const message = [id, label].join(' > ');
    const result = assert(assertion, message);

    return [label, result, assertion];
  };

/**
 * @param {Object|string} id
 * @returns {Array}
 */
function testFactory(id) {
  const identifier = overloadIdentifier(id);
  const queue = [];

  /**
   * @param {string} description
   * @param {boolean|function|Array|Promise} testCase
   * @returns {function}
   */
  function run(description, testCase) {
    const label = sanitizeDescription(description);
    const onResolved = resultFactory(identifier, label);
    const testPromise = overloadPromise(testCase).then(onResolved);

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

//#endregion

//#region default export handler

/**
 * @param {number} total
 * @param {number} errors
 * @returns {string}
 */
function getSummary(total, errors) {
  if (errors) {
    return `${errors} failed, ${total - errors} passed`;
  }

  return `${total} passed`;
}

/**
 * @param {Array} tuple
 * @returns {Promise}
 */
const destructure = ([identifier, queue]) =>
  Promise
    .all([identifier, ...queue]);

/**
 * @param {Array} testSuiteReport
 * @returns {Array}
 */
function restructure([identifier, ...testSuite]) {
  const { length: total } = testSuite;
  const { length: errors } = testSuite
    .filter(([, testResult]) => !testResult);

  console.info(`- ${identifier} (${getSummary(total, errors)})`);

  return [identifier, testSuite, [total, errors]];
}

/**
 * @param {function} testFunction
 *   the function returned by `suite`
 * @returns {Promise<Array>}
 */
const result = testFunction =>
  Promise
    .resolve(registry.get(testFunction))
    .then(destructure)
    .then(restructure);

//#endregion
