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
 *   $ deno install --unstable --quiet --allow-read --allow-net --name estr https://m.bednarz.dev/deno/test_runner.ts
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

import { walk } from 'https://deno.land/std@0.61.0/fs/mod.ts';
import { failing, load, print_report } from '../test-io.js';

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
const test_file_expression = /\.test\.(?:m?js|ts)$/;
const DEFAULT_DEPTH = 1;
const MAX_DEPTH = 10;
const RECURSION_DEPTH = RECURSIVE ? MAX_DEPTH : DEFAULT_DEPTH;

const is_test_file = (file_path: string) =>
  test_file_expression
    .test(file_path);

const get_file_url = (relative_path: string) => [
  FILE_BASE_URL,
  relative_path,
].join('');

const map_to_file_url = (file_path: string) =>
  get_file_url(file_path);

function add_test_file(file_path: string, bucket: string[]) {
  if (is_test_file(file_path)) {
    bucket.push(file_path);
  }
}

async function traverse(base: string) {
  const bucket: string[] = [];
  const options = {
    maxDepth: RECURSION_DEPTH,
  };

  for await (const { path } of walk(base, options)) {
    add_test_file(path, bucket);
  }

  return bucket;
}

const on_files_resolved = (directories: string[][]) =>
  Promise
    .all(
      directories
        .flat()
        .map(map_to_file_url));

const get_exit_code = (error_count: number) =>
  Number(Boolean(error_count));

function on_test_suites_resolved(report: any[]) {
  const [
    result, [
      modules,
      tests,
      errors,
    ],
  ] = report;
  const exit_code = get_exit_code(errors);

  if (errors) {
    print_report('failing', failing(result));
  } else if (!SILENT) {
    print_report('report', result);
  }

  exit(exit_code);
}

function on_error() {
  exit(EXIT_CODE_ERROR);
}

const map_to_files = (base_directory: string) =>
  traverse(base_directory);

const queue = DIRECTORIES.map(map_to_files);

Promise
  .all(queue)
  .then(on_files_resolved)
  .then(load)
  .then(on_test_suites_resolved)
  .catch(on_error);
