/**
 * Copyright 2020 Eric Bednarz <https://m.bednarz.dev>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { component } from '/browser/component.js';
import {
  append,
  create_text_node,
  replace_node,
  select,
  set_attribute,
} from '/browser/dom.js';
import {
  link,
  section, h2, ul, ol, li, div, table, tr, th, td,
  em, strong,
  pre, code, span, anchor,
} from '/browser/html.js';

const { sign } = Math;
const { parse } = JSON;
const { assign } = Object;
const INCREMENT = 1;
const EXTENSION = '.js';
const TEST_EXTENSION = `.test${EXTENSION}`;
const ATTRIBUTE_FAIL = 'data-fail';
const statusList = ['passing', 'failing'];

const FAILING = Symbol('failing');
const SECTION_NODE = Symbol('section node');
const STATUS_NODE = Symbol('status node');
const HEADING_NODE = Symbol('heading node');

const state_marker = state => (state ? em : strong);

const mark_state = (state, children) =>
  state_marker(state)(children);

const display_url = url =>
  url.replace(/^\//, '');

const source_link = href =>
  anchor({
    href,
    target: '_blank',
  }, display_url(href));

function is_hidden(value) {
  return !parse(value);
}

const increment = number => (number + INCREMENT);

const marker = ([main, sub]) =>
  span([
    [main, increment(sub)].join('.'),
    ' ',
  ]);

const assertion_table = ({
  isAssertionHidden,
  isTestPassing,
  assertion: [
    [actualType, actualValue],
    [expectedType, expectedValue],
  ],
}) =>
  div({
    hidden: (isAssertionHidden && isTestPassing),
  }, table([
    tr([
      th({ scope: 'row' }, 'actual'),
      td(code(actualType)),
      td(pre(code(mark_state(isTestPassing, String(actualValue))))),
    ]),
    tr([
      th({ scope: 'row' }, 'expected'),
      td(code(expectedType)),
      td(pre(code(String(expectedValue)))),
    ]),
  ]));

function call_method(instance, name, argumentList) {
  const methods = instance.methods();

  if (methods[name]) {
    methods[name](...argumentList);
  }
}

function delegate_error(instance, reason) {
  const [
    index,
    module,
  ] = instance.attributes('index', 'module');

  console.error(index, module, reason);

  call_method(instance, 'on_rejected', [reason]);
}

function render_result(instance, [, list, [tests, failing]]) {
  update_section(instance, tests, failing);
  instance.set(FAILING, failing);

  append(instance.get(SECTION_NODE), [
    ul({
      hidden: is_hidden(instance.attributes('sources')),
    }, [
      li([
        'test module: ',
        source_link(get_url(instance, TEST_EXTENSION)),
      ]),
      li([
        'module under test: ',
        source_link(get_url(instance, EXTENSION)),
      ]),
    ]),
    create_result_list(instance, list, failing),
  ]);

  call_method(instance, 'on_resolved', [(tests - failing), failing]);
}

function update_section(instance, tests, failing_count) {
  const status = statusList[sign(failing_count)];

  replace_node(instance.get(STATUS_NODE), create_text_node(status));
  instance.get(HEADING_NODE)
    .appendChild(create_text_node(` (${tests} tests)`));

  if (failing_count) {
    instance.get(SECTION_NODE)
      .setAttribute(ATTRIBUTE_FAIL, '');
  }
}

function create_result_list(instance, suite, failing) {
  const to_list_item = ([
    description,
    is_test_passing,
    assertion,
  ], testIndex) =>
    li({
      [ATTRIBUTE_FAIL]: !is_test_passing,
    }, [
      marker([instance.attributes('index'), testIndex]),
      code(`[${statusList[Number(!is_test_passing)]}]`),
      ' ',
      mark_state(is_test_passing, description),
      assertion_table({
        isAssertionHidden: is_hidden(instance.attributes('assertions')),
        isTestPassing: is_test_passing,
        assertion,
      }),
    ]);
  const is_suite_failing = Boolean(failing);

  return ol({
    hidden: (
      is_hidden(instance.attributes('tests'))
      && !is_suite_failing
    ),
    [ATTRIBUTE_FAIL]: is_suite_failing,
  }, suite.map(to_list_item));
}

const get_url = (instance, extension) => [
  ...instance.attributes('path', 'module'),
  extension,
].join('');

function load(instance, origin) {
  const url = get_url(instance, TEST_EXTENSION);

  return import(origin + url)
    .then(resolved => resolved.default)
    .then(result => render_result(instance, result))
    .catch(reason => delegate_error(instance, reason));
}

function create_heading(status, module, index) {
  const children = [
    code([
      '[', status, ']',
    ]),
    ' ',
    anchor({
      href: `./?m=${module}`,
    }, module),
    ' test suite ',
  ];

  if (index) {
    children.unshift(span(index));
  }

  return h2(children);
}

function set_heading_node(instance) {
  const [index, module] = instance.attributes('index', 'module');
  const statusNode = create_text_node('loading');

  instance
    .set(STATUS_NODE, statusNode)
    .set(HEADING_NODE, create_heading(statusNode, module, index));
}

function setup(instance) {
  set_heading_node(instance);

  const section_node = section(instance.get(HEADING_NODE));

  section_node.style.visibility = 'hidden';
  instance.set(SECTION_NODE, section_node);
}

function overload_selector(selector, value, failing) {
  const boolean = parse(value);

  if (selector === 'ul') {
    return boolean;
  }

  return (failing || boolean);
}

function toggle(instance, selector, value) {
  const node_array = select(selector, instance.root);
  const is_visible = overload_selector(
    selector,
    value,
    instance.get(FAILING)
  );

  for (const context_node of node_array) {
    set_attribute(context_node, 'hidden', !is_visible);
  }
}

function set_font_weight(instance) {
  const [tests, sources] = instance.attributes('tests', 'sources');
  const collapsed = (
    is_hidden(tests)
    && is_hidden(sources)
  );

  assign(instance.get(HEADING_NODE).style, {
    fontWeight: collapsed ? '' : 'bold',
  });
}

component('test-suite', {
  attributes: {
    tests(instance, value) {
      toggle(instance, 'ol', value);
      set_font_weight(instance);
    },

    assertions(instance, value) {
      toggle(instance, 'ol > li > div', value);
    },

    sources(instance, value) {
      toggle(instance, 'ul', value);
      set_font_weight(instance);
    },
  },

  connect(instance) {
    instance.set(FAILING, false);
    setup(instance);
  },

  render(instance) {
    const section_node = instance.get(SECTION_NODE);
    const { origin: testOrigin } = new URL(window.location.href);
    const { origin: assetOrigin } = new URL(import.meta.url);

    append(instance.root, [
      link({
        href: `${assetOrigin}/test/test-suite.css`,
        rel: 'stylesheet',
        onload() {
          section_node.style.visibility = '';
        },
      }),
      section_node,
    ]);
    set_font_weight(instance);
    load(instance, testOrigin);
  },
});
