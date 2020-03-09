/**
 * Copyright 2020 Eric Bednarz <https://m.bednarz.dev>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
export {
  disposable,
  sandbox,
};

import { createElement } from './dom.js';

/* global document */

const { assign, create } = Object;
const SIZE = 100;
const RATIO = 2;

const HTML_DOCUMENT = `
<!DOCTYPE html>
<html>
<head>
  <title></title>
</head>
<body></body>
</html>
`.trim();

function createIframe() {
  const iframe = createElement('iframe', {
    srcdoc: HTML_DOCUMENT,
    width: SIZE,
    height: SIZE,
    style: [
      'position:absolute',
      'top:0',
      `left:-${(SIZE * RATIO)}px;`,
    ].join(';'),
  });

  return iframe;
}

function apiFactory(iframe) {
  const { contentWindow: global } = iframe;
  const { document: root } = global;
  const {
    documentElement: html,
    head,
    body,
  } = root;
  const { innerHTML } = html;

  return assign(create(null), {
    set(literal) {
      global.document.body.innerHTML = literal;
    },
    reset() {
      const pristine = root.createElement('html');

      pristine.innerHTML = innerHTML;
      html.parentNode.replaceChild(pristine, html);
    },
    destroy() {
      document.body.removeChild(iframe);
    },
    global,
    root,
    html,
    head,
    body,
  });
}

function sandbox() {
  const { body } = document;
  const iframe = createIframe();

  function executor(resolve) {
    function onIframeLoad({ target }) {
      resolve(apiFactory(target));
    }

    iframe.onload = onIframeLoad;
  }

  body.appendChild(iframe);

  return new Promise(executor);
}

const disposable = callback =>
  sandbox()
    .then(function onIframeResolved({ destroy, ...rest }) {
      const result = callback(rest);

      if (result instanceof Promise) {
        return result
          .then(function resolve(value) {
            destroy();

            return value;
          });
      }

      destroy();

      return result;
    });
