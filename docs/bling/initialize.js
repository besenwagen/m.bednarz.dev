export {
  GITHUB_MODULES,
  SVG_SYMBOLS,
};

import { json, text } from '/browser/request.js';
import { network } from '/browser/resource.js';

//#region GitHub

const API_ORIGIN = 'https://api.github.com';
const USER_NAME = 'eric-bednarz-dev';
const REPOSITORY = 'ECMAScript-modules';
const DOCUMENT_ROOT = 'docs';
const MODULE_ROOT = 'universal';

const PATH_EXPRESSION = new RegExp(`^${DOCUMENT_ROOT}/`);
const MODULE_EXPRESSION = /^(?!.*\.test\.js$).*\.(?:j|t)s$/;

const isModule = file =>
  MODULE_EXPRESSION
    .test(file);

const toRelativePath = path =>
  path
    .replace(PATH_EXPRESSION, '');

function resolveUrl(segment) {
  const pathSegments = [
    'repos',
    USER_NAME,
    REPOSITORY,
    'contents',
    DOCUMENT_ROOT,
  ];

  if (segment !== MODULE_ROOT) {
    pathSegments
      .push(segment);
  }

  return [
    API_ORIGIN,
    ...pathSegments,
  ].join('/');
}

const transformGithubContents = array =>
  array
    .map(({ path }) => path)
    .filter(isModule)
    .map(toRelativePath);

//#endregion

const SVG_SYMBOLS_URL = 'https://eric.bednarz.dev/symbols.svg';
const LIFESPAN = 3600;

const [
  GITHUB_MODULES,
  SVG_SYMBOLS,
] = network({
  ['github:modules'](subDirectory) {
    return [
      [json, [resolveUrl(subDirectory)]],
      transformGithubContents,
      LIFESPAN,
    ];
  },
  'svg:symbols': [
    [text, [SVG_SYMBOLS_URL]],
    LIFESPAN,
  ],
});
