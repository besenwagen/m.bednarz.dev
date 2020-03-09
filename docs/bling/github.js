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

const createLink = relativePath =>
  createElement('A', {
    href: `/${relativePath}`,
  }, relativePath);

const createListItem = relativePath =>
  createElement('LI', createLink(relativePath));

const createListFragment = list =>
  list
    .map(relativePath =>
      createListItem(relativePath));

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
