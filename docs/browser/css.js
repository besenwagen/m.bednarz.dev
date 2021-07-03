/**
 * Copyright 2020 Eric Bednarz <https://m.bednarz.dev>
 * SPDX-License-Identifier: EUPL-1.2
 */
export {
  css,
  max_width,
  min_width,
  motion,
  style_sheet,
  to_css_text,
  to_rule_set,
};

/* global document */

const { entries } = Object;

function css(strings, ...properties) {
  const { length } = properties;

  function to_style_sheet(css_text, substring, index) {
    const value = `${css_text}${substring}`;

    if (index < length) {
      return `${value}${properties[index]}`;
    }

    return value;
  }

  return strings.reduce(to_style_sheet, '');
}

const dashify = property =>
  property
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase();

const to_declaration = ([name, value]) =>
  [dashify(name), value]
    .join(':');

const to_css_text = dictionary =>
  entries(dictionary)
    .map(to_declaration)
    .join(';');

const to_block = value =>
  ['{', '}']
    .join(value);

const to_rule_set = (selectors, dictionary) => [
  selectors,
  to_block(to_css_text(dictionary)),
].join('');

const to_media_rule_sets = dictionary =>
  entries(dictionary)
    .map(entry => to_rule_set(...entry))
    .join('');

function to_rule(selectors, dictionary) {
  if (/^@media /.test(selectors)) {
    return [
      selectors,
      to_block(to_media_rule_sets(dictionary)),
    ].join('');
  }

  return to_rule_set(selectors, dictionary);
}

function insert_rules(sheet, rule_sets) {
  const { length } = sheet.cssRules;

  for (const [index, value] of entries(rule_sets).entries()) {
    sheet.insertRule(to_rule(...value), (length + index));
  }
}

function style_sheet(rule_sets, context_node = document.head) {
  // CSP: insert the target element into DOM first
  const style_element = context_node
    .appendChild(document.createElement('STYLE'));
  const { sheet } = style_element;

  insert_rules(sheet, rule_sets);

  return style_element;
}

//#region Media Query

const MEDIA_SCREEN = '@media only screen';
const MOTION = 'prefers-reduced-motion';

const query = (...argument_list) =>
  `and (${to_declaration(argument_list)})`;

const max_width = width => [
  MEDIA_SCREEN,
  query('max-width', width),
].join(' ');

const min_width = width => [
  MEDIA_SCREEN,
  query('min-width', width),
].join(' ');

const motion = () => [
  MEDIA_SCREEN,
  query(MOTION, 'no-preference'),
].join(' ');

//#endregion
