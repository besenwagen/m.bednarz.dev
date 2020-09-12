export {
  render,
};

import { GITHUB_MODULES } from './initialize.js';
import { resource } from '/browser/resource.js';
import { create_element, replace_node } from '/browser/dom.js';

/* global document */

const sections = [
  'universal',
  'browser',
  'deno',
  'node',
];

const get_module_toc = directory =>
  resource(GITHUB_MODULES, directory);

function basename(relative_path) {
  const [, base] = /(?:^|\/)([^.]+)\.(?:html|js|ts)/
    .exec(relative_path);

  return base;
}

const create_source_link = relative_path =>
  create_element('A', {
    href: `/${relative_path}`,
    title: 'source',
    'aria-label': `${basename(relative_path)} module source`,
  }, relative_path);

const create_documentation_link = relative_path =>
  create_element('A', {
    href: `/${relative_path}`,
    title: 'documentation',
    'aria-label': `${basename(relative_path)} module documentation`,
  }, '?');

const module_tuple = [
  function source(accumulator, relative_path) {
    accumulator.push(create_source_link(relative_path));
  },
  function documentation(accumulator, relative_path) {
    if (relative_path) {
      accumulator.push(create_documentation_link(relative_path));
    }
  },
];

function to_links(accumulator, relative_path, index) {
  module_tuple[index](accumulator, relative_path);

  return accumulator;
}

const create_list_Item = path_pair =>
  create_element('LI',
    path_pair.reduce(to_links, []));

const create_list_fragment = list =>
  list
    .map(ordered_pair =>
      create_list_Item(ordered_pair));

const create_list = array =>
  create_element('UL', create_list_fragment(array));

const to_element = id =>
  document.getElementById(id);

const not_null = value =>
  (value !== null);

function render_result(element) {
  const { id } = element;
  const placeholder = element.querySelector('p');

  function on_resolved(array) {
    replace_node(placeholder, create_list(array));
  }

  get_module_toc(id)
    .then(on_resolved);
}

function render() {
  sections
    .map(to_element)
    .filter(not_null)
    .forEach(render_result);
}
