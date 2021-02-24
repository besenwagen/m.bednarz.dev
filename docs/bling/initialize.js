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

const to_relative_path = path =>
  path
    .replace(PATH_EXPRESSION, '');

function resolve_url(segment) {
  const path_segments = [
    'repos',
    USER_NAME,
    REPOSITORY,
    'contents',
    DOCUMENT_ROOT,
  ];

  if (segment !== MODULE_ROOT) {
    path_segments
      .push(segment);
  }

  return [
    API_ORIGIN,
    ...path_segments,
  ].join('/');
}

function filter(input, output) {
  function use_match([filename, basename]) {
    const documentation = `${basename}.html`;

    if (input.includes(documentation)) {
      output.push([filename, documentation]);
    } else {
      output.push([filename, null]);
    }
  }

  return function reduce_file(file) {
    const match = MODULE_EXPRESSION.exec(file);

    if (match) {
      use_match(match);
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

const flatten = ({ path }) => to_relative_path(path);

function transform_github_contents(array) {
  const toc = array.map(flatten);

  return reduce(toc);
}

//#endregion

const SVG_SYMBOLS_URL = '/bling/symbols.svg';
const LIFESPAN = 3600;

const [
  GITHUB_MODULES,
  SVG_SYMBOLS,
] = network({
  ['github:modules'](sub_directory) {
    return [
      [json, [resolve_url(sub_directory)]],
      transform_github_contents,
      LIFESPAN,
    ];
  },
  'svg:symbols': [
    [text, [SVG_SYMBOLS_URL]],
    LIFESPAN,
  ],
});
