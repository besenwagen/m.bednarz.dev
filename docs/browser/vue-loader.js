/**
 * Copyright 2020 Eric Bednarz <https://m.bednarz.dev>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
export {
  load_component,
  mangle_imports as _mangle_imports,
};

import { evil_import } from './evil-import.js';

/* global window document fetch */

const { assign, create } = Object;

// imports in dynamically imported blob/data URLs need absolute URLs
const { origin } = window.location;

const { url: module_url } = import.meta;

const sfc_import = /^import ([^\s]+) from "([^"]+\.vue)";?$/gm;
const es_import = /^(import {[^}]+} from) "([^"]+\.js)";?$/gm;

function mangle_sfc_imports(input) {
  const output = input
    .trim()
    .replace(
      sfc_import,
      'const $1 = () => load_component("$2");'
    );

  if (input === output) {
    return input;
  }

  return [
    `import { load_component } from '${module_url}'`,
    output,
  ].join('\n');
}

const mangle_imports = input =>
  mangle_sfc_imports(input)
    .replace(
      es_import,
      `$1 "${origin}$2";`
    );

const transform = {
  script(node) {
    const { textContent } = node;

    return mangle_imports(textContent);
  },
  style(node) {
    return node;
  },
  template(node) {
    return node.innerHTML.trim();
  },
};

function create_dom_sandbox(html_literal) {
  const sandbox = document.implementation.createHTMLDocument('');

  sandbox.body.innerHTML = html_literal;

  return sandbox;
}

function parse(vue_literal) {
  const sandbox = create_dom_sandbox(vue_literal);

  function to_normalized_node(accumulator, value) {
    const element = sandbox.querySelector(value);

    accumulator[value] = element ?
      transform[value](element) :
      element;

    return accumulator;
  }

  return ['style', 'template', 'script']
    .reduce(to_normalized_node, create(null));
}

//#region Single File Component promise

const on_response = response =>
  response
    .text();

function on_resolved(vue_literal) {
  const {
    script,
    style,
    template,
  } = parse(vue_literal);

  if (style) {
    document.head.appendChild(style);
  }

  return evil_import(script)
    .then(exported => assign(exported.default, {
      template,
    }));
}

function on_rejected(reason) {
  console.error(reason);
}

const load_component = url =>
  fetch(url)
    .then(on_response)
    .then(on_resolved)
    .catch(on_rejected);

//#endregion
