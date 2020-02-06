// Environment agnostic test automation I/O utilities

export {
  load,
  objectify,
  printReport,
  printSummary,

  // private
  jsonEscape,
  yamlify,
};

const { isArray } = Array;
const { entries, fromEntries } = Object;

// ## Input

const INITIAL_COUNT = 0;
const TOTAL_INDEX = 0;
const ERROR_INDEX = 1;

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

/**
 * @param {number} modules
 * @param {number} tests
 * @param {number} errors
 */
function printSummary(modules, tests, errors) {
  console.info('summary:');
  console.info(`  modules: ${modules}`);
  console.info(`  tests: ${tests}`);
  console.info(`  failed: ${errors}`);
}

function printReport(result) {
  console.info('report:');
  console.info(yamlify(result));
}

/**
 * @param {number} subTotal
 * @param {number} value
 * @returns {number}
 */
const reduceCount = (subTotal, value) =>
  subTotal + value;

/**
 * @param {Array} array
 * @param {number} index
 * @returns {number}
 */
const reduceIndex = (array, index) =>
  array
    .map(([, , stats]) => stats[index])
    .reduce(reduceCount, INITIAL_COUNT);

/**
 * @param {Array} result
 * @return {Array}
 */
function withStats(result) {
  const { length: moduleCount } = result;
  const testCount = reduceIndex(result, TOTAL_INDEX);
  const errorCount = reduceIndex(result, ERROR_INDEX);

  printSummary(moduleCount, testCount, errorCount);

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

  console.info('progress:');

  return Promise
    .all(modules)
    .then(withStats);
}

// ## Output

// ### Object

function toFailureObject(failure) {
  const toObject = keyValuePair => fromEntries([keyValuePair]);
  const [actual, expected] = failure.map(toObject);

  return {
    actual,
    expected,
  };
}

function diagnose([key, value, failure]) {
  if (isArray(failure)) {
    return [key, toFailureObject(failure)];
  }

  return [key, value];
}

/**
 * @param {Array} entry
 * @returns {Array}
 */
const toSuite = ([key, value]) =>
  [key, fromEntries(value.map(diagnose))];

/**
 * @param {Array} result
 * @returns {Object}
 */
const objectify = result =>
  fromEntries(result.map(toSuite));

// ### YAML

/**
 * noop placeholder
 * @param {string} value
 * @returns {string}
 */
function indent(value) {
  return value;
}

const escapeDoubleQuotes = string =>
  string
    .replace(/\\([\s\S])|(")/g, '\\$1$2');

function jsonEscape(value) {
  return `"${escapeDoubleQuotes(String(value))}"`;
}

const caseToYaml = (key, value) => [
  indent(`      ${key}:`),
  indent(`        ${typeof value}: ${jsonEscape(value)}`),
];

function assertionToYaml(name, result, [actual, expected]) {
  const toCase = tuple => caseToYaml(...tuple);
  const toCaseList = (accumulator, value) => [
    ...accumulator,
    ...toCase(value),
  ];
  const caseList = entries({
    actual,
    expected,
  })
    .reduce(toCaseList, []);

  return [indent(`    ${jsonEscape(name)}:`), ...caseList];
}

function suiteToYaml(suite) {
  function toLines(accumulator, [description, result, assertion]) {
    accumulator.push(...assertionToYaml(description, result, assertion));

    return accumulator;
  }

  return suite.reduce(toLines, []);
}

function yamlify(result) {
  const buffer = [];

  for (const [id, suite] of result) {
    buffer.push(indent(`  ${id}:`), ...suiteToYaml(suite));
  }

  return buffer.join('\n');
}
