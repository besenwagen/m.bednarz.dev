/**
 * Copyright 2020, 2021 Eric Bednarz <https://m.bednarz.dev>
 * SPDX-License-Identifier: EUPL-1.2
 *
 * Runtime loader for Vue 3 Single-File Components (SFC)
 * - no dependencies
 * - development only
 *
 * @todo: add basic scoped style support
 */
export {
  asyncomponent,
  mangle_imports as _mangle_imports,
  parse as _parse,
};

/* global Blob document fetch */

const { assign, create } = Object;
const { createObjectURL, revokeObjectURL } = URL;
const EXPORT = '$MONKEY_PATCH$';

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

const sfc_regexp = /^import (\S+) from (?:"([^"]+\.vue)"|'([^']+\.vue)');?$/gm;
const es_regexp = /^(import (?:{[^}]+}|\S+) from) (?:"([^"]+\.m?js)"|'([^']+\.m?js)');?$/gm;

function parse_captured([,
  head,
  double_quoted,
  single_quoted,
], sfc_url) {
  const import_url = (double_quoted || single_quoted);

  return [
    head,
    new URL(import_url, sfc_url).href,
  ];
}

function mangle_sfc_imports(sfc_source, sfc_url, initiator) {
  function resolve_sfc_import(...argument_list) {
    const [head, tail] = parse_captured(argument_list, sfc_url);

    return `const ${head} = ${EXPORT}('${tail}');`;
  }

  const input = sfc_source.trim();
  const output = input
    .replace(sfc_regexp, resolve_sfc_import);

  if (input === output) {
    return output;
  }

  return [
    `import ${EXPORT} from '${initiator}';`,
    output,
  ].join('\n');
}

function mangle_imports(sfc_source, sfc_url, iniitator) {
  function replace_es_import(...argument_list) {
    const [head, tail] = parse_captured(argument_list, sfc_url);

    return `${head} '${tail}';`;
  }

  // Resolve ES imports before SFC resolving adds an ES import
  const clipboard = sfc_source
    .replace(es_regexp, replace_es_import);

  return mangle_sfc_imports(clipboard, sfc_url, iniitator);
}

//#endregion

const transform = {
  script(node, url, initiator) {
    const { textContent } = node;

    return mangle_imports(textContent, url, initiator);
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

function parse(source_text, source_url, initiator) {
  const sandbox = create_dom_sandbox(source_text);

  function to_normalized_node(accumulator, value) {
    const element = sandbox.querySelector(value);

    accumulator[value] = element ?
      transform[value](element, source_url, initiator) :
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
    .then(body => [body, response.url]);

function on_resolved(data, initiator) {
  const {
    script,
    style,
    template,
  } = parse(...data, initiator);

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

const asyncomponent = (path, initiator) =>
  () =>
    fetch(path)
      .then(on_response)
      .then(data => on_resolved(data, initiator))
      .catch(on_rejected);

//#endregion
