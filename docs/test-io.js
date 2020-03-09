/**
 * Environment agnostic test automation I/O utilities.
 * Copyright 2019, 2020 Eric Bednarz <https://m.bednarz.dev>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
export {
  failing,
  load,
  printReport,
  printSummary,
  jsonEscape as _jsonEscape,
  yamlify as _yamlify,
};

const { entries } = Object;

//#region Input

const INITIAL_COUNT = 0;
const TOTAL_INDEX = 0;
const ERROR_INDEX = 1;

const getDefaultModule = module =>
  module.default;

const loadModule = path =>
  import(path)
    .then(getDefaultModule);

function printSummary(modules, tests, errors) {
  console.info('summary:');
  console.info(`  modules: ${modules}`);
  console.info(`  tests: ${tests}`);
  console.info(`  failing: ${errors}`);
}

const reduceCount = (subTotal, value) =>
  subTotal + value;

const reduceIndex = (array, index) =>
  array
    .map(([, , stats]) => stats[index])
    .reduce(reduceCount, INITIAL_COUNT);

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

const isFailing = ([, value]) => !value;

function toFailing(accumulator, [suiteName, tests]) {
  const failing = tests.filter(isFailing);

  if (failing.length) {
    accumulator.push([suiteName, failing]);
  }

  return accumulator;
}

const failing = result =>
  result.reduce(toFailing, []);

//#region YAML

function indent(value) {
  return value;
}

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

const jsonEscape = value =>
  doubleQuote(escapeDoubleQuotes(String(value)));

function escapeAssertionValue(value) {
  if (typeof value === 'string') {
    return jsonEscape(value.replace(/\n/gm, '\\n'));
  }

  return value;
}

const caseToYaml = (key, [type, value]) => [
  indent(`      ${key}:`),
  indent(`        ${type}: ${escapeAssertionValue(value)}`),
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
  function toLines(buffer, [description, result, assertion]) {
    buffer.push(...assertionToYaml(description, result, assertion));

    return buffer;
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

function printReport(label, result) {
  console.info(`${label}:`);
  console.info(yamlify(result));
}

//#endregion
