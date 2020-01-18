/**
 * Why:  Node.js only supports file URLs for ECMAScript modules.
 * How:  Process test files with the extensions `.test.js` under
 *       one or more context directories relative to the process.
 * What: Deno test runner for native ECMAScript modules.
 *
 * @see https://m.bednarz.dev/test.js for writing tests.
 *
 * Verbose example (try before you buy :-):
 *
 *   $ deno --allow-read --allow-net https://m.bednarz.dev/deno/testRunner.js client server
 *
 * Runs all tests in `./client` and `./server`.
 *
 * Installation:
 *
 *   $ deno install estr https://m.bednarz.dev/deno/testRunner.js --allow-read --allow-net
 *
 * where `estr` is the executable name of your choice.
 * Make sure that `~/.deno/bin` is in your `$PATH` and run
 *
 *   $ estr client server
 *
 * Options:
 *
 *  -r  recursive  traverse all sub directories 10 levels deep
 *  -s  silent     write only the summary to stdout
 *
 */

/* global Deno */

import { walk } from 'https://deno.land/std/fs/mod.ts';
import { load, objectify } from '../test.js';

const { args, cwd, exit } = Deno;
const { stringify } = JSON;

const ARGUMENTS_OFFSET = 1;
const EXIT_CODE_ERROR = 1;
const JSON_INDENT = 2;
const FILE_BASE_URL = `file://${cwd()}/`;
const YAML_DOC_SEPARATOR = '---';
const ARGUMENT_LIST = args
  .slice(ARGUMENTS_OFFSET);
const DIRECTORIES = ARGUMENT_LIST
  .filter(value => !value.startsWith('-'));
const SILENT = ARGUMENT_LIST
  .includes('-s');
const RECURSIVE = ARGUMENT_LIST
  .includes('-r');
const testFileExpression = /\/[^/]+\.test\.js$/;
const DEFAULT_DEPTH = 1;
const MAX_DEPTH = 10;
const maxDepth = RECURSIVE ? MAX_DEPTH : DEFAULT_DEPTH;

/**
 * @param {string} filePath
 * @return {boolean}
 */
const isTestFile = filePath =>
  testFileExpression.test(filePath);

/**
 * @param {string} relativePath
 * @return {string}
 */
const getFileUrl = relativePath => [
  FILE_BASE_URL,
  relativePath,
].join('');

/**
 * @param {string} filePath
 * @return {boolean}
 */
const mapToFileUrl = filePath =>
  getFileUrl(filePath);

/**
 * @param {string} filePath
 * @param {Array} bucket
 */
function addTestFile(filePath, bucket) {
  if (isTestFile(filePath)) {
    bucket.push(filePath);
  }
}

/**
 * @param {string} base
 * @returns {Promise<string[]>}
 */
async function traverse(base) {
  const bucket = [];
  const options = {
    maxDepth,
  };

  for await (const { filename } of walk(base, options)) {
    addTestFile(filename, bucket);
  }

  return bucket;
}

/**
 * @param {string[][]} directories
 * @return {Promise<Array>}
 */
const onFilesResolved = directories =>
  Promise
    .all(
      directories
        .flat()
        .map(mapToFileUrl));

/**
 * @param {number} errorCount
 * @return {number}
 */
const getExitCode = errorCount =>
  Number(Boolean(errorCount));

/**
 * @param {number} count
 */
function reportModules(count) {
  console.info(YAML_DOC_SEPARATOR);
  console.info(`modules loaded: ${count}`);
}

/**
 * @param {Object[]} modules
 */
function reportTests(total, errors) {
  if (errors) {
    console.info(`tests failed: ${errors}`);
  }

  console.info(`tests passed: ${total - errors}`);
}

/**
 * @param {Object[]} modules
 */
function reportVerbose(result) {
  console.info(YAML_DOC_SEPARATOR);
  console.info(stringify(objectify(result), null, JSON_INDENT));
}

function summarize(modules, total, errors) {
  reportModules(modules);
  reportTests(total, errors);
}

/**
 * @param {Object[]} modules
 */
function onTestSuitesResolved([result, [modules, tests, errors]]) {
  const exitCode = getExitCode(errors);

  summarize(modules, tests, errors);

  if (!SILENT) {
    reportVerbose(result);
  }

  exit(exitCode);
}

/**
 * @param {Error} reason
 */
function onError({ message }) {
  console.error(message);
  exit(EXIT_CODE_ERROR);
}

/**
 * @param {string} baseDirectory
 * @return {Array}
 */
const mapToFiles = baseDirectory =>
  traverse(baseDirectory);

/**
 * @type {Promise[]}
 */
const queue = DIRECTORIES.map(mapToFiles);

Promise
  .all(queue)
  .then(onFilesResolved)
  .then(load)
  .then(onTestSuitesResolved)
  .catch(onError);
