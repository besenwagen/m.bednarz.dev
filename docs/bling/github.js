export {
  render,
};

import { GITHUB_MODULES } from './initialize.js';
import { resource } from '/browser/resource.js';
import { createElement, replaceNode } from '/browser/dom.js';

/* global document */

const sections = [
  'universal',
  'browser',
  'deno',
  'node',
];

const getModuleToc = directory =>
  resource(GITHUB_MODULES, directory);

function basename(relativePath) {
  const [, base] = /(?:^|\/)([^.]+)\.(?:html|js|ts)/
    .exec(relativePath);

  return base;
}

const createSourceLink = relativePath =>
  createElement('A', {
    href: `/${relativePath}`,
    title: 'source',
    'aria-label': `${basename(relativePath)} module source`,
  }, relativePath);

const createDocumentationLink = relativePath =>
  createElement('A', {
    href: `/${relativePath}`,
    title: 'documentation',
    'aria-label': `${basename(relativePath)} module documentation`,
  }, '?');

const moduleTuple = [
  function source(accumulator, relativePath) {
    accumulator.push(createSourceLink(relativePath));
  },
  function documentation(accumulator, relativePath) {
    if (relativePath) {
      accumulator.push(createDocumentationLink(relativePath));
    }
  },
];

function toLinks(accumulator, relativePath, index) {
  moduleTuple[index](accumulator, relativePath);

  return accumulator;
}

const createListItem = pathPair =>
  createElement('LI',
    pathPair.reduce(toLinks, []));

const createListFragment = list =>
  list
    .map(orderedPair =>
      createListItem(orderedPair));

const createList = array =>
  createElement('UL', createListFragment(array));

const toElement = id =>
  document.getElementById(id);

const notNull = value =>
  (value !== null);

function renderResult(element) {
  const { id } = element;
  const placeholder = element.querySelector('p');

  function onResolved(array) {
    replaceNode(placeholder, createList(array));
  }

  getModuleToc(id)
    .then(onResolved);
}

function render() {
  sections
    .map(toElement)
    .filter(notNull)
    .forEach(renderResult);
}
