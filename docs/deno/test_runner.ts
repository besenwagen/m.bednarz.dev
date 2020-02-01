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
 *   $ deno --allow-read --allow-net https://m.bednarz.dev/deno/test_runner.ts client server
 *
 * Runs all tests in `./client` and `./server`.
 *
 * Installation:
 *
 *   $ deno install estr https://m.bednarz.dev/deno/test_runner.ts --allow-read --allow-net
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
import { load, objectify } from '../test-io.js';

const { args, cwd, exit } = Deno;
const { stringify } = JSON;

const EXIT_CODE_ERROR = 1;
const JSON_INDENT = 2;
const FILE_BASE_URL = `file://${cwd()}/`;
const YAML_DOC_SEPARATOR = '---';
const ARGUMENT_LIST = args
  .filter(value => value.startsWith('-'));
const DIRECTORIES = args
  .filter(value => !value.startsWith('-'));
const SILENT = ARGUMENT_LIST
  .includes('-s');
const RECURSIVE = ARGUMENT_LIST
  .includes('-r');
const testFileExpression = /\/[^/]+\.test\.js$/;
const DEFAULT_DEPTH = 1;
const MAX_DEPTH = 10;
const maxDepth = RECURSIVE ? MAX_DEPTH : DEFAULT_DEPTH;

const isTestFile = (filePath: string): boolean =>
  testFileExpression.test(filePath);

const getFileUrl = (relativePath: string): string => [
  FILE_BASE_URL,
  relativePath,
].join('');

const mapToFileUrl = (filePath: string): string =>
  getFileUrl(filePath);

function addTestFile(filePath: string, bucket: string[]) {
  if (isTestFile(filePath)) {
    bucket.push(filePath);
  }
}

async function traverse(base: string): Promise<string[]> {
  const bucket = [];
  const options = {
    maxDepth,
  };

  for await (const { filename } of walk(base, options)) {
    addTestFile(filename, bucket);
  }

  return bucket;
}

const onFilesResolved = (
  directories: string[][]
): Promise<string[]> =>
  Promise
    .all(
      directories
        .flat()
        .map(mapToFileUrl));

const getExitCode = (errorCount: number): number =>
  Number(Boolean(errorCount));

function reportModules(count: number) {
  console.info(YAML_DOC_SEPARATOR);
  console.info(`modules loaded: ${count}`);
}

function reportTests(total: number, errors: number) {
  if (errors) {
    console.info(`tests failed: ${errors}`);
  }

  console.info(`tests passed: ${total - errors}`);
}

function reportVerbose(result: string[]) {
  console.info(YAML_DOC_SEPARATOR);
  console.info(stringify(objectify(result), null, JSON_INDENT));
}

function summarize(modules: any, total: number, errors: number) {
  reportModules(modules);
  reportTests(total, errors);
}

function onTestSuitesResolved([
  result, [
    modules,
    tests,
    errors,
  ]
]: [
  any[], [
    any[],
    number,
    number,
  ],
]) {
  const exitCode = getExitCode(errors);

  summarize(modules, tests, errors);

  if (!SILENT) {
    reportVerbose(result);
  }

  exit(exitCode);
}

function onError({ message }: Error) {
  console.error(message);
  exit(EXIT_CODE_ERROR);
}

const mapToFiles = (baseDirectory: string): Promise<string[]> =>
  traverse(baseDirectory);

const queue = DIRECTORIES.map(mapToFiles);

Promise
  .all(queue)
  .then(onFilesResolved)
  .then(load)
  .then(onTestSuitesResolved)
  .catch(onError);