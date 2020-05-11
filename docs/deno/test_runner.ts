/**
 * Copyright 2019, 2020 Eric Bednarz <https://m.bednarz.dev>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Why:  Node.js only supports file URLs for ECMAScript modules.
 * How:  Process test files with the extensions `.test.js` under
 *       one or more context directories relative to the process.
 * What: Deno test runner for native ECMAScript modules.
 *
 * @see https://m.bednarz.dev/test.js for writing tests.
 *
 * Verbose example (try before you buy :-):
 *
 *   $ deno run --unstable --allow-read --allow-net https://m.bednarz.dev/deno/test_runner.ts client server
 *
 * Runs all tests in `./client` and `./server`.
 *
 * Installation:
 *
 *   $ deno install --unstable --allow-read --allow-net --name estr https://m.bednarz.dev/deno/test_runner.ts
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
import { failing, load, printReport } from '../test-io.js';

const { args, cwd, exit } = Deno;

const EXIT_CODE_ERROR = 1;
const FILE_BASE_URL = `file://${cwd()}/`;
const ARGUMENT_LIST = args
  .filter(value => value.startsWith('-'));
const DIRECTORIES = args
  .filter(value => !value.startsWith('-'));
const SILENT = ARGUMENT_LIST
  .includes('-s');
const RECURSIVE = ARGUMENT_LIST
  .includes('-r');
const testFileExpression = /\.test\.js$/;
const DEFAULT_DEPTH = 1;
const MAX_DEPTH = 10;
const maxDepth = RECURSIVE ? MAX_DEPTH : DEFAULT_DEPTH;

const isTestFile = (filePath: string) =>
  testFileExpression
    .test(filePath);

const getFileUrl = (relativePath: string) => [
  FILE_BASE_URL,
  relativePath,
].join('');

const mapToFileUrl = (filePath: string) =>
  getFileUrl(filePath);

function addTestFile(filePath: string, bucket: string[]) {
  if (isTestFile(filePath)) {
    bucket.push(filePath);
  }
}

async function traverse(base: string) {
  const bucket: string[] = [];
  const options = {
    maxDepth,
  };

  for await (const { path } of walk(base, options)) {
    addTestFile(path, bucket);
  }

  return bucket;
}

const onFilesResolved = (directories: string[][]) =>
  Promise
    .all(
      directories
        .flat()
        .map(mapToFileUrl));

const getExitCode = (errorCount: number) =>
  Number(Boolean(errorCount));

function onTestSuitesResolved(report: any[]) {
  const [
    result, [
      modules,
      tests,
      errors,
    ],
  ] = report;
  const exitCode = getExitCode(errors);

  if (errors) {
    printReport('failing', failing(result));
  } else if (!SILENT) {
    printReport('report', result);
  }

  exit(exitCode);
}

function onError() {
  exit(EXIT_CODE_ERROR);
}

const mapToFiles = (baseDirectory: string) =>
  traverse(baseDirectory);

const queue = DIRECTORIES.map(mapToFiles);

Promise
  .all(queue)
  .then(onFilesResolved)
  .then(load)
  .then(onTestSuitesResolved)
  .catch(onError);
