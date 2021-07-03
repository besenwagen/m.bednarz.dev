/**
 * Copyright 2019, 2020 Eric Bednarz <https://m.bednarz.dev>
 * SPDX-License-Identifier: EUPL-1.2
 *
 * @see https://m.bednarz.dev/deno/test_runner.html
 */
import { walk } from "https://deno.land/std@0.66.0/fs/mod.ts";
import { io_factory, load } from "../test-io.js";

/* global Deno */

const { args, cwd, exit } = Deno;

const pwd = cwd();
const ARGUMENT_LIST = args
  .filter((value) => value.startsWith("-"));
const DIRECTORIES = args
  .filter((value) => !value.startsWith("-"));
const silent = ARGUMENT_LIST
  .includes("-s");
const RECURSIVE = ARGUMENT_LIST
  .includes("-r");
const test_file_expression = /\.test\.(?:m?js|ts)$/;
const DEFAULT_DEPTH = 1;
const MAX_DEPTH = 10;
const RECURSION_DEPTH = RECURSIVE ? MAX_DEPTH : DEFAULT_DEPTH;

const is_test_file = (file_path: string) =>
  test_file_expression
    .test(file_path);

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

const map_to_files = (base_directory: string) => traverse(base_directory);

const queue = DIRECTORIES.map(map_to_files);

const {
  on_glob_resolved,
  on_suites_resolved,
  on_rejected,
} = io_factory({
  exit,
  pwd,
  silent,
});

Promise
  .all(queue)
  .then(on_glob_resolved)
  .then(load)
  // @ts-ignore
  .then(on_suites_resolved)
  .catch(on_rejected);
