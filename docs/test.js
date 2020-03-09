/**
 * Copyright 2019, 2020 Eric Bednarz <https://m.bednarz.dev>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
export {
  result,
  suite,
  forceUrl as _forceUrl,
  formatAssertionTuple as _formatAssertionTuple,
};

const { isArray } = Array;
const testPrimitiveExpression = /^(?:string|number|boolean)$/;
const PREFIX_INVALID = 'Invalid test case:';
const ORDERED_PAIR_LENGTH = 2;

//#region module identifier

const BASE_URL = 'https://localhost/';
const PATH_OFFSET = 1;

function getShellWorkingDirectory() {
  /* global Deno process */
  if (typeof Deno !== 'undefined') {
    return Deno.cwd();
  }

  if (typeof process !== 'undefined') {
    return process.cwd();
  }

  return '';
}

function normalizePath(pathname, protocol) {
  if (protocol === 'file:') {
    const prefix = getShellWorkingDirectory();
    const prefixExpression = new RegExp(`^${prefix}/`);

    return pathname.replace(prefixExpression, '');
  }

  return pathname.substring(PATH_OFFSET);
}

const isImportMeta = value => (
  (Object
    .prototype
    .toString
    .call(value) === '[object Object]')
  && (typeof value.url === 'string')
);

function overloadIdentifier(value) {
  if (isImportMeta(value)) {
    return value.url;
  }

  return value;
}

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

  return normalizePath(pathname, protocol);
}

const getModuleUrl = value =>
  forceUrl(overloadIdentifier(value));

//#endregion

//#region assertion

function getAssertionType(value) {
  if (value === null) {
    return String(value);
  }

  return typeof value;
}

const errorLine = value => `\n! ${value}`;

function formatMultilineAssertion(prefix, value) {
  const INDENT = 11;
  const indent = ' '.repeat(INDENT);
  const newLine = `\\${errorLine(`${indent}\\`)}`;
  const tail = value.replace(/\n/gm, newLine);

  return [
    errorLine(prefix),
    errorLine(`${indent}\\${tail}\\`),
  ].join('');
}

function formatStringAssertion(prefix, value) {
  if (value.includes('\n')) {
    return formatMultilineAssertion(prefix, value);
  }

  return errorLine(`${prefix} \\${value}\\`);
}

function formatAssertion(label, [type, value]) {
  const prefix = `${label} (${type})`;

  if (type === 'string') {
    return formatStringAssertion(prefix, value);
  }

  return errorLine(`${prefix} ${value}`);
}

const formatAssertionTuple = (actual, expected) => [
  formatAssertion('  [actual]', actual),
  formatAssertion('[expected]', expected),
].join('');

const toTypeTuple = value => [
  getAssertionType(value),
  value,
];

const getTypeTuple = (actual, expected) =>
  [actual, expected].map(toTypeTuple);

const getAssertionMessage = ([
  suiteName,
  testName,
], typedAssertion) => [
  errorLine(`   [suite] ${suiteName}`),
  errorLine(`    [test] ${testName}`),
  formatAssertionTuple(...typedAssertion),
].join('');

function assert([actual, expected], contextTuple) {
  const testResult = (actual === expected);
  const typeTuple = getTypeTuple(actual, expected);
  const message = getAssertionMessage(contextTuple, typeTuple);

  console.assert(testResult, message);

  return [testResult, typeTuple];
}

//#endregion

//#region test case

const isTestPrimitive = value => (
  testPrimitiveExpression.test(typeof value)
  || (value === null)
  || (value === undefined)
);

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

function forceBoolean(value) {
  if (typeof value === 'boolean') {
    return value;
  }

  throw new TypeError([
    PREFIX_INVALID,
    'test case must resolve a boolean',
  ].join(' '));
}

const isOrderedPair = value => (
  isArray(value)
  && (value.length === ORDERED_PAIR_LENGTH)
);

function overloadSync(value) {
  if (isOrderedPair(value)) {
    return forceTestPrimitives(value);
  }

  return [forceBoolean(value), true];
}

function overloadCallable(value) {
  if (typeof value === 'function') {
    return value();
  }

  return value;
}

function forceValue(value) {
  if ((value === undefined) || (value === null)) {
    throw new TypeError([
      PREFIX_INVALID,
      'null or undefined',
    ].join(' '));
  }

  return value;
}

function overloadPromise(value) {
  const normalized = forceValue(overloadCallable(value));

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

const sanitizeDescription = value =>
  value
    .replace(/\s+/gm, ' ')
    .trim();

const resultFactory = (id, label) =>
  function onTestResultResolved(assertion) {
    return [
      label,
      ...assert(assertion, [id, label]),
    ];
  };

function testFactory(id) {
  const identifier = getModuleUrl(id);
  const queue = [];

  function run(description, testCase) {
    const label = sanitizeDescription(description);
    const onResolved = resultFactory(identifier, label);
    const testPromise = overloadPromise(testCase).then(onResolved);

    queue.push(testPromise);

    return run;
  }

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

function getSummary(total, errors) {
  if (errors) {
    return `${errors} failed, ${total - errors} passed`;
  }

  return `${total} passed`;
}

const destructure = ([identifier, queue]) =>
  Promise
    .all([identifier, ...queue]);

function restructure([identifier, ...testSuite]) {
  const { length: total } = testSuite;
  const { length: errors } = testSuite
    .filter(([, testResult]) => !testResult);

  console.info(`- ${identifier} (${getSummary(total, errors)})`);

  return [identifier, testSuite, [total, errors]];
}

const result = testFunction =>
  Promise
    .resolve(registry.get(testFunction))
    .then(destructure)
    .then(restructure)
    .catch(error => error);

//#endregion
