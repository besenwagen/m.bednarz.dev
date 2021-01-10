/**
 * Copyright 2020, 2021 Eric Bednarz <https://m.bednarz.dev>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Runtime loader for Vue Single-File Components (SFC)
 * - no dependencies
 * - development only
 *
 * @todo: add basic scoped style support
 */
export {
  loadComponent as default,
  mangle_imports as _mangle_imports,
  parse as _parse,
  EXPORT as _EXPORT,
  IMPORT as _IMPORT,
};

/* global Blob URL document fetch */

const { assign, create } = Object;
const { createObjectURL, revokeObjectURL } = URL;
const { url: IMPORT } = import.meta;
const EXPORT = '$VUE_SFC$';

function evil_import(source) {
  const blob = new Blob([source], {
    type: 'application/javascript',
  });
  const blob_url = createObjectURL(blob);

  function on_import_resolved(exports) {
    revokeObjectURL(blob);

    return exports;
  }

  return import(blob_url)
    .then(on_import_resolved);
}

//#region Blob import URLs must be absolute

const sfc_regexp = /^import (\S+) from (?:"([^"]+\.vue)"|'([^']+\.vue)');?$/gm
const es_regexp = /^(import (?:{[^}]+}|\S+) from) (?:"([^"]+\.m?js)"|'([^']+\.m?js)');?$/gm

function parse_captured([,
  head,
  double_quoted,
  single_quoted,
], url) {
  const import_url = (double_quoted || single_quoted);

  return [
    head,
    new URL(import_url, url).href,
  ];
}

function mangle_sfc_imports(source, url) {
  function resolve_sfc_import(...argument_list) {
    const [head, tail] = parse_captured(argument_list, url);

    return `const ${head} = ${EXPORT}('${tail}');`;
  }

  const input = source.trim();
  const output = input
    .replace(sfc_regexp, resolve_sfc_import);

  if (input === output) {
    return output;
  }

  return [
    `import ${EXPORT} from '${IMPORT}';`,
    output,
  ].join('\n');
}

function mangle_imports(source, url) {
  function replace_es_import(...argument_list) {
    const [head, tail] = parse_captured(argument_list, url);

    return `${head} '${tail}';`;
  }

  // Resolve ES imports before SFC resolving adds an ES import
  const clipboard = source
    .replace(es_regexp, replace_es_import);

  return mangle_sfc_imports(clipboard, url);
}

//#endregion

const transform = {
  script(node, url) {
    const { textContent } = node;

    return mangle_imports(textContent, url);
  },
  style(node) {
    return node;
  },
  template(node) {
    return node.innerHTML.trim();
  },
};

function create_dom_sandbox(html_literal) {
  const sandbox = document
    .implementation
    .createHTMLDocument('');

  sandbox.body.innerHTML = html_literal;

  return sandbox;
}

function parse(text, url) {
  const sandbox = create_dom_sandbox(text);

  function to_normalized_node(accumulator, value) {
    const element = sandbox.querySelector(value);

    accumulator[value] = element ?
      transform[value](element, url) :
      element;

    return accumulator;
  }

  return [
    'style',
    'template',
    'script',
  ].reduce(to_normalized_node, create(null));
}

//#region Single File Component promise

const on_response = response =>
  response
    .text()
    .then(body => [
      body,
      response.url,
    ]);

function on_resolved(data) {
  const {
    script,
    style,
    template,
  } = parse(...data);

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

const loadComponent = path =>
  () =>
    fetch(path)
      .then(on_response)
      .then(on_resolved)
      .catch(on_rejected);

//#endregion
