/**
 * Copyright 2020 Eric Bednarz <https://m.bednarz.dev>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
export {
  cssLiteral,
  maxWidth,
  minWidth,
  motion,
  styleSheet,
  toCssText,
  toRuleSet,
};

/* global document */

const { entries } = Object;

const dashify = property =>
  property
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase();

const toDeclaration = ([name, value]) =>
  [dashify(name), value]
    .join(':');

const toCssText = dictionary =>
  entries(dictionary)
    .map(toDeclaration)
    .join(';');

const toBlock = value =>
  ['{', '}']
    .join(value);

const toRuleSet = (selectors, dictionary) => [
  selectors,
  toBlock(toCssText(dictionary)),
].join('');

const toMediaRuleSets = dictionary =>
  entries(dictionary)
    .map(entry => toRuleSet(...entry))
    .join('');

function toRule(selectors, dictionary) {
  if (/^@media /.test(selectors)) {
    return [
      selectors,
      toBlock(toMediaRuleSets(dictionary)),
    ].join('');
  }

  return toRuleSet(selectors, dictionary);
}

function insertRules(sheet, ruleSets) {
  const { length } = sheet.cssRules;

  for (const [index, value] of entries(ruleSets).entries()) {
    sheet.insertRule(toRule(...value), (length + index));
  }
}

function styleSheet(ruleSets, contextNode = document.head) {
  // CSP: insert the target element into DOM first
  const styleElement = contextNode
    .appendChild(document.createElement('STYLE'));
  const { sheet } = styleElement;

  insertRules(sheet, ruleSets);

  return styleElement;
}

const cssLiteral = ruleSets =>
  entries(ruleSets)
    .map(entry => toRule(...entry))
    .join('\n');

//#region Media Query

const MEDIA_SCREEN = '@media only screen';
const MOTION = 'prefers-reduced-motion';

const query = (...argumentList) =>
  `and (${toDeclaration(argumentList)})`;

const maxWidth = width => [
  MEDIA_SCREEN,
  query('max-width', width),
].join(' ');

const minWidth = width => [
  MEDIA_SCREEN,
  query('min-width', width),
].join(' ');

const motion = () => [
  MEDIA_SCREEN,
  query(MOTION, 'no-preference'),
].join(' ');

//#endregion
