export {
  run,
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
  const { documentElement: html } = global.document;
  const { body } = global.document;
  const { innerHTML } = html;

  return assign(create(null), {
    set(literal) {
      global.document.body.innerHTML = literal;
    },
    reset() {
      const root = global.document.createElement('html');

      root.innerHTML = innerHTML;
      html.parentNode.replaceChild(root, html);
    },
    destroy() {
      document.body.removeChild(iframe);
    },
    global,
    html,
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

const run = callback =>
  sandbox()
    .then(function onIframeResolved({ destroy, ...rest }) {
      const result = callback(rest);

      destroy();

      return result;
    });
