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
const MODULE_EXPRESSION = /^(?!.*\.test\.js$)(.*)\.(?:j|t)s$/;

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

function filter(input, output) {
  function useMatch([filename, basename]) {
    const documentation = `${basename}.html`;

    if (input.includes(documentation)) {
      output.push([filename, documentation]);
    } else {
      output.push([filename, null]);
    }
  }

  return function reduceFile(file) {
    const match = MODULE_EXPRESSION.exec(file);

    if (match) {
      useMatch(match);
    }
  };
}

function reduce(toc) {
  const modules = [];
  const process = filter(toc, modules);

  for (const file of toc) {
    process(file);
  }

  return modules;
}

const flatten = ({ path }) => toRelativePath(path);

function transformGithubContents(array) {
  const toc = array.map(flatten);

  return reduce(toc);
}

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
