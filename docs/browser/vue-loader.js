/**
 * Copyright 2020 Eric Bednarz <https://m.bednarz.dev>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
export {
  loadComponent,
  mangleImports as _mangleImports,
};

import { evilImport } from './evil-import.js';

/* global window document fetch */

const { assign, create } = Object;

// imports in dynamically imported blob/data URLs need absolute URLs
const { origin } = window.location;

const { url: moduleUrl } = import.meta;

const sfcImport = /^import ([^\s]+) from "([^"]+\.vue)";?$/gm;
const esImport = /^(import {[^}]+} from) "([^"]+\.js)";?$/gm;

function mangleSfcImports(input) {
  const output = input
    .trim()
    .replace(
      sfcImport,
      'const $1 = () => loadComponent("$2");'
    );

  if (input === output) {
    return input;
  }

  return [
    `import { loadComponent } from '${moduleUrl}'`,
    output,
  ].join('\n');
}

const mangleImports = input =>
  mangleSfcImports(input)
    .replace(
      esImport,
      `$1 "${origin}$2";`
    );

const transform = {
  script(node) {
    const { textContent } = node;

    return mangleImports(textContent);
  },
  style(node) {
    return node;
  },
  template(node) {
    return node.innerHTML.trim();
  },
};

function createDomSandbox(htmlLiteral) {
  const sandbox = document.implementation.createHTMLDocument('');

  sandbox.body.innerHTML = htmlLiteral;

  return sandbox;
}

function parse(vueLiteral) {
  const sandbox = createDomSandbox(vueLiteral);

  function toNormalizedNode(accumulator, value) {
    const element = sandbox.querySelector(value);

    accumulator[value] = element ?
      transform[value](element) :
      element;

    return accumulator;
  }

  return ['style', 'template', 'script']
    .reduce(toNormalizedNode, create(null));
}

//#region Single File Component promise

const onResponse = response =>
  response
    .text();

function onResolved(vueLiteral) {
  const {
    script,
    style,
    template,
  } = parse(vueLiteral);

  if (style) {
    document.head.appendChild(style);
  }

  return evilImport(script)
    .then(exported => assign(exported.default, {
      template,
    }));
}

function onRejected(reason) {
  console.error(reason);
}

const loadComponent = url =>
  fetch(url)
    .then(onResponse)
    .then(onResolved)
    .catch(onRejected);

//#endregion
