/**
 * Copyright 2020 Eric Bednarz <https://m.bednarz.dev>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * WHATWG HTML Living Standard
 * @see https://html.spec.whatwg.org/multipage/
 */

import { createElement } from './dom.js';

export const link = attributes =>
  createElement('link', attributes);

export const style = (...argumentList) =>
  createElement('style', ...argumentList);

//#region Sections (WHATWG 4.3)

export const article = (...argumentList) =>
  createElement('article', ...argumentList);

export const section = (...argumentList) =>
  createElement('section', ...argumentList);

export const nav = (...argumentList) =>
  createElement('nav', ...argumentList);

export const aside = (...argumentList) =>
  createElement('aside', ...argumentList);

export const h1 = (...argumentList) =>
  createElement('h1', ...argumentList);

export const h2 = (...argumentList) =>
  createElement('h2', ...argumentList);

export const h3 = (...argumentList) =>
  createElement('h3', ...argumentList);

export const h4 = (...argumentList) =>
  createElement('h4', ...argumentList);

export const header = (...argumentList) =>
  createElement('header', ...argumentList);

export const footer = (...argumentList) =>
  createElement('footer', ...argumentList);

//#endregion

//#region Grouping content (WHATWG 4.4)

export const paragraph = (...argumentList) =>
  createElement('p', ...argumentList);

export const pre = (...argumentList) =>
  createElement('pre', ...argumentList);

export const blockquote = (...argumentList) =>
  createElement('blockquotes', ...argumentList);

export const ol = (...argumentList) =>
  createElement('ol', ...argumentList);

export const ul = (...argumentList) =>
  createElement('ul', ...argumentList);

export const li = (...argumentList) =>
  createElement('li', ...argumentList);

export const figure = (...argumentList) =>
  createElement('figure', ...argumentList);

export const figcaption = (...argumentList) =>
  createElement('figcaption', ...argumentList);

export const div = (...argumentList) =>
  createElement('div', ...argumentList);

//#endregion

//#region Text-level semantics

export const anchor = (...argumentList) =>
  createElement('a', ...argumentList);

export const em = (...argumentList) =>
  createElement('em', ...argumentList);

export const strong = (...argumentList) =>
  createElement('strong', ...argumentList);

export const small = (...argumentList) =>
  createElement('small', ...argumentList);

export const cite = (...argumentList) =>
  createElement('cite', ...argumentList);

export const code = (...argumentList) =>
  createElement('code', ...argumentList);

export const italic = (...argumentList) =>
  createElement('italic', ...argumentList);

export const bold = (...argumentList) =>
  createElement('bold', ...argumentList);

export const span = (...argumentList) =>
  createElement('span', ...argumentList);

//#endregion

//#region Tabular data (WHATWG #4.9)

export const table = (...argumentList) =>
  createElement('table', ...argumentList);

export const caption = (...argumentList) =>
  createElement('caption', ...argumentList);

export const colgroup = (...argumentList) =>
  createElement('colgroup', ...argumentList);

export const col = (...argumentList) =>
  createElement('col', ...argumentList);

export const thead = (...argumentList) =>
  createElement('thead', ...argumentList);

export const tfoot = (...argumentList) =>
  createElement('tfoot', ...argumentList);

export const tbody = (...argumentList) =>
  createElement('tbody', ...argumentList);

export const tr = (...argumentList) =>
  createElement('tr', ...argumentList);

export const td = (...argumentList) =>
  createElement('td', ...argumentList);

export const th = (...argumentList) =>
  createElement('th', ...argumentList);

//#endregion

//#region Form (WHATWG #4.10)

export const form = (...argumentList) =>
  createElement('form', ...argumentList);

export const label = (...argumentList) =>
  createElement('label', ...argumentList);

export const input = (...argumentList) =>
  createElement('input', ...argumentList);

export const button = (...argumentList) =>
  createElement('button', ...argumentList);

export const select = (...argumentList) =>
  createElement('select', ...argumentList);

export const datalist = (...argumentList) =>
  createElement('datalist', ...argumentList);

export const optgroup = (...argumentList) =>
  createElement('optgroup', ...argumentList);

export const option = (...argumentList) =>
  createElement('option', ...argumentList);

export const textarea = (...argumentList) =>
  createElement('textarea', ...argumentList);

export const fieldset = (...argumentList) =>
  createElement('fieldset', ...argumentList);

export const legend = (...argumentList) =>
  createElement('legend', ...argumentList);

//#endregion
