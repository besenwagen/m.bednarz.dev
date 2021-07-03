/**
 * Copyright 2020 Eric Bednarz <https://m.bednarz.dev>
 * SPDX-License-Identifier: EUPL-1.2
 */
export {
  append,
  create_text_node,
  create_element,
  create_fragment,
  element_factory,
  get_style,
  prepend,
  purge,
  replace_node,
  select,
  set_attribute,
  set_style,
  to_fragment,
};

/* global window document */

const {
  from,
  isArray: is_array,
} = Array;
const {
  entries,
  fromEntries: from_entries,
  prototype: {
    toString: to_string,
  },
} = Object;

//#region get

const select = (selector, context_node = document) =>
  from(context_node.querySelectorAll(selector));

function get_style(element) {
  const style = window.getComputedStyle(element);

  return style;
}

//#endregion

//#region set

function transfer(source, target) {
  while (source.firstChild) {
    target.appendChild(source.firstChild);
  }
}

function to_fragment(html_literal) {
  const clipboard = document.createElement('DIV');
  const fragment = document.createDocumentFragment();

  clipboard.innerHTML = html_literal;
  transfer(clipboard, fragment);

  return fragment;
}

function get_css_text(style) {
  if (style) {
    return entries(style)
      .filter(([, value]) => value)
      .map(pair => pair.join(':'))
      .join(';');
  }

  return '';
}

function set_style(element, style) {
  element.style.cssText = get_css_text(style);

  return element;
}

function set_boolean_attribute(element, name, value) {
  if (value) {
    element.setAttribute(name, '');
  } else {
    element.removeAttribute(name);
  }
}

function set_attribute(element, name, value) {
  if (typeof value === 'boolean') {
    set_boolean_attribute(element, name, value);
  } else if (name.startsWith('on')) {
    element[name] = value;
  } else {
    element.setAttribute(name, value);
  }

  return element;
}

function set_attributes(element, attributes) {
  for (const [key, value] of entries(attributes)) {
    set_attribute(element, key, value);
  }

  return element;
}

function purge(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }

  return element;
}

function as_node(value) {
  if (/^(?:number|string)$/.test(typeof value)) {
    return document.createTextNode(value);
  }

  return value;
}

function append_node(element, children) {
  element.appendChild(as_node(children));

  return element;
}

function prepend_node(element, children) {
  element.insertBefore(as_node(children), element.firstChild);

  return element;
}

function append(element, children) {
  const node = is_array(children) ?
    create_fragment(children) :
    children;

  return append_node(element, node);
}

function prepend(element, children) {
  const node = is_array(children) ?
    create_fragment(children) :
    children;

  return prepend_node(element, node);
}

const replace_node = (previous, next) =>
  previous
    .parentNode
    .replaceChild(next, previous);

const create_fragment = node_array =>
  node_array
    .reduce(
      append,
      document.createDocumentFragment()
    );

const create_text_node = string_literal =>
  document.createTextNode(string_literal);

const get_mixed_arity_index = value =>
  Number(to_string.call(value) === '[object Object]');

const plain_element = type =>
  document.createElement(type);

const with_attributes_or_children = (type, value) =>
  mixed_arity[get_mixed_arity_index(value)](plain_element(type), value);

const with_attributes_and_children = (type, attributes, children) =>
  append(set_attributes(plain_element(type), attributes), children);

const mixed_arity = [
  append,
  set_attributes,
];

const arity = [
  undefined,
  plain_element,
  with_attributes_or_children,
  with_attributes_and_children,
];

const create_element = (...argument_list) =>
  arity[argument_list.length](...argument_list);

const element_factory = types =>
  from_entries(types
    .map(type => [
      type,
      (...argument_list) =>
        create_element(type, ...argument_list),
    ]));

//#endregion
