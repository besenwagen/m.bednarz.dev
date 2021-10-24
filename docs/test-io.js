/**
 * Environment agnostic test automation I/O utilities.
 * Copyright 2019, 2020, 2021 Eric Bednarz <https://m.bednarz.dev>
 * SPDX-License-Identifier: EUPL-1.2
 */
export {
  io_factory,
  load,
  json_escape as _json_escape,
  yamlify as _yamlify,
};

const { entries } = Object;

//#region Input

const INITIAL_COUNT = 0;
const TOTAL_INDEX = 0;
const ERROR_INDEX = 1;

const get_default_module = module =>
  module.default;

const load_module = path =>
  import(path)
    .then(get_default_module);

function print_summary(modules, tests, errors) {
  console.info('summary:');
  console.info(`  modules: ${modules}`);
  console.info(`  tests: ${tests}`);
  console.info(`  failing: ${errors}`);
}

const reduce_count = (sub_total, value) =>
  sub_total + value;

const reduce_index = (array, index) =>
  array
    .map(([, , stats]) => stats[index])
    .reduce(reduce_count, INITIAL_COUNT);

function with_stats(result) {
  const { length: module_count } = result;
  const test_count = reduce_index(result, TOTAL_INDEX);
  const error_count = reduce_index(result, ERROR_INDEX);

  print_summary(module_count, test_count, error_count);

  return [
    result,
    [module_count, test_count, error_count],
  ];
}

function on_error(error) {
  console.error(error);
  throw error;
}

function load(queue) {
  const modules = queue.map(load_module);

  console.info('progress:');

  return Promise
    .all(modules)
    .then(with_stats)
    .catch(on_error);
}

//#endregion

//#region Output

const is_failing = ([, value]) => !value;

function to_failing(accumulator, [suite_name, tests]) {
  const failing = tests.filter(is_failing);

  if (failing.length) {
    accumulator.push([suite_name, failing]);
  }

  return accumulator;
}

const failing = result =>
  result.reduce(to_failing, []);

//#region YAML

function indent(value) {
  return value;
}

const escape_double_quotes = string =>
  string
    .replace(/\\([\s\S])|(")/g, '\\$1$2');

function double_quote(value) {
  const match = /^"(.*)"|\\"(.*)\\"$/.exec(value);

  if (match) {
    const [, quoted, stripped] = match;

    return `"${(quoted || stripped)}"`;
  }

  return `"${value}"`;
}

const json_escape = value =>
  double_quote(escape_double_quotes(String(value)));

function escape_assertion_value(value) {
  if (typeof value === 'string') {
    return json_escape(value.replace(/\n/gm, '\\n'));
  }

  return value;
}

const case_to_yaml = (key, [type, value]) => [
  indent(`      ${key}:`),
  indent(`        ${type}: ${escape_assertion_value(value)}`),
];

function assertion_to_yaml(name, result, [actual, expected]) {
  const to_case = tuple => case_to_yaml(...tuple);
  const to_case_list = (accumulator, value) => [
    ...accumulator,
    ...to_case(value),
  ];
  const case_list = entries({
    actual,
    expected,
  })
    .reduce(to_case_list, []);

  return [indent(`    ${json_escape(name)}:`), ...case_list];
}

function suite_to_yaml(suite) {
  function to_lines(buffer, [description, result, assertion]) {
    buffer.push(...assertion_to_yaml(description, result, assertion));

    return buffer;
  }

  return suite.reduce(to_lines, []);
}

function yamlify(result) {
  const buffer = [];

  for (const [id, suite] of result) {
    buffer.push(indent(`  ${id}:`), ...suite_to_yaml(suite));
  }

  return buffer.join('\n');
}

function print_report(label, result) {
  console.info(`${label}:`);
  console.info(yamlify(result));
}

//#endregion

//#region I/O

const EXIT_CODE_ERROR = 1;
const SCHEME = 'file:';

const get_exit_code = error_count =>
  Number(Boolean(error_count));

function get_file_base_url(path) {
  if (path.startsWith(SCHEME)) {
    return path;
  }

  return `${SCHEME}//${path}/`;
}

function io_factory({
  exit,
  pwd,
  silent,
}) {
  const get_file_url = relative_path => [
    get_file_base_url(pwd),
    relative_path,
  ].join('');

  const map_to_file_url = file_path =>
    get_file_url(file_path);

  const expand = matches =>
    matches
      .flat()
      .map(map_to_file_url);

  return {
    on_glob_resolved(matches) {
      const expanded = expand(matches);

      return Promise.all(expand(matches));
    },

    on_suites_resolved([result, [, , errors]]) {
      const exit_code = get_exit_code(errors);

      if (errors) {
        print_report('failing', failing(result));
      } else if (!silent) {
        print_report('report', result);
      }

      exit(exit_code);
    },

    on_rejected(reason) {
      console.error(reason);
      exit(EXIT_CODE_ERROR);
    },
  };
}

//#endregion
