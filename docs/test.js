/**
 * Copyright 2019, 2020 Eric Bednarz <https://m.bednarz.dev>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
export {
  result,
  suite,
  force_url as _force_url,
  format_assertion_tuple as _format_assertion_tuple,
};

const { isArray } = Array;
const { is } = Object;
const test_primitive_expression = /^(?:string|number|boolean)$/;
const PREFIX_INVALID = 'Invalid test case:';
const ORDERED_PAIR_LENGTH = 2;

//#region module identifier

const BASE_URL = 'https://localhost/';
const PATH_OFFSET = 1;

function get_shell_working_directory() {
  /* global Deno process */
  if (typeof Deno !== 'undefined') {
    return Deno.cwd();
  }

  if (typeof process !== 'undefined') {
    return process.cwd();
  }

  return '';
}

function get_relative_file_path(pathname) {
  const prefix = get_shell_working_directory();
  const prefix_expression = new RegExp(`^${prefix}/`);

  return pathname.replace(prefix_expression, '');
}

function get_relative_url_path(input_path, protocol) {
  if (protocol === 'blob:') {
    const { pathname } = new URL(input_path);

    return pathname;
  }

  return input_path;
}

function normalize_path(pathname, protocol) {
  if (protocol === 'file:') {
    return get_relative_file_path(pathname);
  }

  return get_relative_url_path(pathname, protocol)
    .substring(PATH_OFFSET);
}

const is_import_meta = value => (
  (Object
    .prototype
    .toString
    .call(value) === '[object Object]')
  && (typeof value.url === 'string')
);

function overload_identifier(value) {
  if (is_import_meta(value)) {
    return value.url;
  }

  return value;
}

function force_url(value) {
  const {
    pathname,
    protocol,
  } = new URL(value, BASE_URL);

  if (!/^(?:https|file|blob):$/.test(protocol)) {
    throw new Error([
      "Expected 'https:', 'file:' or 'blob:' protocol, got '",
      protocol,
      "'",
    ].join(''));
  }

  return normalize_path(pathname, protocol);
}

const get_module_url = value =>
  force_url(overload_identifier(value));

//#endregion

//#region assertion

function get_assertion_type(value) {
  if (value === null) {
    return String(value);
  }

  return typeof value;
}

const error_line = value => `\n! ${value}`;

function format_multiline_assertion(prefix, value) {
  const INDENT = 11;
  const indent = ' '.repeat(INDENT);
  const newline = `\\${error_line(`${indent}\\`)}`;
  const tail = value.replace(/\n/gm, newline);

  return [
    error_line(prefix),
    error_line(`${indent}\\${tail}\\`),
  ].join('');
}

function format_string_assertion(prefix, value) {
  if (value.includes('\n')) {
    return format_multiline_assertion(prefix, value);
  }

  return error_line(`${prefix} \\${value}\\`);
}

function format_assertion(label, [type, value]) {
  const prefix = `${label} (${type})`;

  if (type === 'string') {
    return format_string_assertion(prefix, value);
  }

  return error_line(`${prefix} ${value}`);
}

const format_assertion_tuple = (actual, expected) => [
  format_assertion('  [actual]', actual),
  format_assertion('[expected]', expected),
].join('');

const to_type_tuple = value => [
  get_assertion_type(value),
  value,
];

const get_type_tuple = (actual, expected) =>
  [actual, expected].map(to_type_tuple);

const get_assertion_message = ([
  suite_name,
  test_name,
], typed_assertion) => [
  error_line(`   [suite] ${suite_name}`),
  error_line(`    [test] ${test_name}`),
  format_assertion_tuple(...typed_assertion),
].join('');

const parse_assertion = (actual, expected) => [
  is(actual, expected),
  get_type_tuple(actual, expected),
];

function log_assertion(test_result, type_tuple, context_tuple) {
  const [suite_identifier] = context_tuple;

  if (suite_identifier) {
    const message = get_assertion_message(context_tuple, type_tuple);

    console.assert(test_result, message);
  }
}

function assert(assertion, context_tuple) {
  const parsed = parse_assertion(...assertion);

  log_assertion(...parsed, context_tuple);

  return parsed;
}

//#endregion

//#region test case

const is_test_primitive = value => (
  test_primitive_expression.test(typeof value)
  || (value === null)
  || (value === undefined)
);

function force_test_primitives(ordered_pair) {
  if (ordered_pair.every(is_test_primitive)) {
    return ordered_pair;
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

function force_boolean(value) {
  if (typeof value === 'boolean') {
    return value;
  }

  throw new TypeError([
    PREFIX_INVALID,
    'test case must resolve a boolean',
  ].join(' '));
}

const is_ordered_pair = value => (
  isArray(value)
  && (value.length === ORDERED_PAIR_LENGTH)
);

function overload_sync(value) {
  if (is_ordered_pair(value)) {
    return force_test_primitives(value);
  }

  return [force_boolean(value), true];
}

function overload_callable(value) {
  if (typeof value === 'function') {
    return value();
  }

  return value;
}

function force_value(value) {
  if ((value === undefined) || (value === null)) {
    throw new TypeError([
      PREFIX_INVALID,
      'null or undefined',
    ].join(' '));
  }

  return value;
}

function overload_promise(value) {
  const normalized = force_value(overload_callable(value));

  if (normalized.constructor === Promise) {
    return normalized
      .then(sync_result =>
        overload_sync(sync_result));
  }

  return Promise
    .resolve(overload_sync(normalized));
}

//#endregion

const registry = new WeakMap();

//#region test suite

const sanitize_description = value =>
  value
    .replace(/\s+/gm, ' ')
    .trim();

const result_factory = (id, label) =>
  function on_test_result_resolved(assertion) {
    return [
      label,
      ...assert(assertion, [id, label]),
    ];
  };

function test_factory(id) {
  const identifier = get_module_url(id);
  const queue = [];

  function run(description, test_case) {
    const label = sanitize_description(description);
    const on_resolved = result_factory(identifier, label);
    const test_promise = overload_promise(test_case).then(on_resolved);

    queue.push(test_promise);

    return run;
  }

  function scope(function_under_test) {
    const { name } = function_under_test;

    function scoped_test(label, test_case) {
      const scoped_label = `${name}(): ${label}`;

      run(scoped_label, test_case);

      return scoped_test;
    }

    return scoped_test;
  }

  return [identifier, queue, run, scope];
}

function suite(id) {
  const [identifier, queue, run, scope] = test_factory(id);

  function overload(...argument_list) {
    const [first] = argument_list;

    if (typeof first === 'function') {
      return scope(first);
    }

    return run(...argument_list);
  }

  registry.set(overload, [identifier, queue]);

  return overload;
}

//#endregion

//#region default export handler

function get_summary(total, errors) {
  if (errors) {
    return `${errors} failed, ${total - errors} passed`;
  }

  return `${total} passed`;
}

const destructure = ([identifier, queue]) =>
  Promise
    .all([identifier, ...queue]);

function restructure([identifier, ...test_suite]) {
  const { length: total } = test_suite;
  const { length: errors } = test_suite
    .filter(([, test_result]) => !test_result);

  if (identifier) {
    console.info(`- ${identifier} (${get_summary(total, errors)})`);
  }

  return [identifier, test_suite, [total, errors]];
}

const result = test_function =>
  Promise
    .resolve(registry.get(test_function))
    .then(destructure)
    .then(restructure)
    .catch(error => error);

//#endregion
