// Environment agnostic test automation I/O utilities

export {
  failing,
  load,
  printReport,
  printSummary,

  // private
  jsonEscape,
  yamlify,
};

const { isArray } = Array;
const { entries, fromEntries } = Object;

//#region Input

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
  console.info(`  failing: ${errors}`);
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

function onError(error) {
  console.error(error);
  throw error;
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
    .then(withStats)
    .catch(onError);
}

//#endregion

//#region Output

/**
 * @param {Array} tuple
 * @returns {boolean}
 */
const isFailing = ([, value]) => !value;

/**
 * @param {Array} accumulator
 * @param {Array} tuple
 * @returns {Array}
 */
function toFailing(accumulator, [suiteName, tests]) {
  const failing = tests.filter(isFailing);

  if (failing.length) {
    accumulator.push([suiteName, failing]);
  }

  return accumulator;
}

/**
 * @param {Array} result
 * @returns {Array}
 */
const failing = result =>
  result.reduce(toFailing, []);

//#region YAML

/**
 * noop placeholder
 * @param {string} value
 * @returns {string}
 */
function indent(value) {
  return value;
}

/**
 * @param {string} string
 * @returns {string}
 */
const escapeDoubleQuotes = string =>
  string
    .replace(/\\([\s\S])|(")/g, '\\$1$2');

function doubleQuote(value) {
  const match = /^"(.*)"|\\"(.*)\\"$/.exec(value);

  if (match) {
    const [, quoted, stripped] = match;

    return `"${(quoted || stripped)}"`;
  }

  return `"${value}"`;
}

/**
 * @param {*}
 * @returns {string}
 */
const jsonEscape = value =>
  doubleQuote(escapeDoubleQuotes(String(value)));

function escapeAssertionValue(value) {
  if (typeof value === 'string') {
    return jsonEscape(value.replace(/\n/gm, '\\n'));
  }

  return value;
}

/**
 * @param {string} key
 * @param {Array} value
 * @returns {Array}
 */
const caseToYaml = (key, [type, value]) => [
  indent(`      ${key}:`),
  indent(`        ${type}: ${escapeAssertionValue(value)}`),
];

/**
 * @param {string} name
 * @param {boolean} result
 * @param {Array} assertion
 */
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

/**
 * @param {Array} suite
 * @returns {Array}
 */
function suiteToYaml(suite) {
  function toLines(buffer, [description, result, assertion]) {
    buffer.push(...assertionToYaml(description, result, assertion));

    return buffer;
  }

  return suite.reduce(toLines, []);
}

/**
 * @param {Array} result
 * @returns {string}
 */
function yamlify(result) {
  const buffer = [];

  for (const [id, suite] of result) {
    buffer.push(indent(`  ${id}:`), ...suiteToYaml(suite));
  }

  return buffer.join('\n');
}

/**
 * @param {string} label
 * @param {Array} result
 */
function printReport(label, result) {
  console.info(`${label}:`);
  console.info(yamlify(result));
}

//#endregion

//#endregion
