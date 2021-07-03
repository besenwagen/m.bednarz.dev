/**
 * Copyright 2020 Eric Bednarz <https://m.bednarz.dev>
 * SPDX-License-Identifier: EUPL-1.2
 */

/**
 * WHATWG HTML Living Standard
 * @see https://html.spec.whatwg.org/multipage/
 */

import { create_element } from './dom.js';

export const link = attributes =>
  create_element('link', attributes);

export const style = (...argument_list) =>
  create_element('style', ...argument_list);

//#region Sections (WHATWG 4.3)

export const article = (...argument_list) =>
  create_element('article', ...argument_list);

export const section = (...argument_list) =>
  create_element('section', ...argument_list);

export const nav = (...argument_list) =>
  create_element('nav', ...argument_list);

export const aside = (...argument_list) =>
  create_element('aside', ...argument_list);

export const h1 = (...argument_list) =>
  create_element('h1', ...argument_list);

export const h2 = (...argument_list) =>
  create_element('h2', ...argument_list);

export const h3 = (...argument_list) =>
  create_element('h3', ...argument_list);

export const h4 = (...argument_list) =>
  create_element('h4', ...argument_list);

export const header = (...argument_list) =>
  create_element('header', ...argument_list);

export const footer = (...argument_list) =>
  create_element('footer', ...argument_list);

//#endregion

//#region Grouping content (WHATWG 4.4)

export const paragraph = (...argument_list) =>
  create_element('p', ...argument_list);

export const pre = (...argument_list) =>
  create_element('pre', ...argument_list);

export const blockquote = (...argument_list) =>
  create_element('blockquotes', ...argument_list);

export const ol = (...argument_list) =>
  create_element('ol', ...argument_list);

export const ul = (...argument_list) =>
  create_element('ul', ...argument_list);

export const li = (...argument_list) =>
  create_element('li', ...argument_list);

export const figure = (...argument_list) =>
  create_element('figure', ...argument_list);

export const figcaption = (...argument_list) =>
  create_element('figcaption', ...argument_list);

export const div = (...argument_list) =>
  create_element('div', ...argument_list);

//#endregion

//#region Text-level semantics

export const anchor = (...argument_list) =>
  create_element('a', ...argument_list);

export const em = (...argument_list) =>
  create_element('em', ...argument_list);

export const strong = (...argument_list) =>
  create_element('strong', ...argument_list);

export const small = (...argument_list) =>
  create_element('small', ...argument_list);

export const cite = (...argument_list) =>
  create_element('cite', ...argument_list);

export const code = (...argument_list) =>
  create_element('code', ...argument_list);

export const italic = (...argument_list) =>
  create_element('italic', ...argument_list);

export const bold = (...argument_list) =>
  create_element('bold', ...argument_list);

export const span = (...argument_list) =>
  create_element('span', ...argument_list);

//#endregion

//#region Tabular data (WHATWG #4.9)

export const table = (...argument_list) =>
  create_element('table', ...argument_list);

export const caption = (...argument_list) =>
  create_element('caption', ...argument_list);

export const colgroup = (...argument_list) =>
  create_element('colgroup', ...argument_list);

export const col = (...argument_list) =>
  create_element('col', ...argument_list);

export const thead = (...argument_list) =>
  create_element('thead', ...argument_list);

export const tfoot = (...argument_list) =>
  create_element('tfoot', ...argument_list);

export const tbody = (...argument_list) =>
  create_element('tbody', ...argument_list);

export const tr = (...argument_list) =>
  create_element('tr', ...argument_list);

export const td = (...argument_list) =>
  create_element('td', ...argument_list);

export const th = (...argument_list) =>
  create_element('th', ...argument_list);

//#endregion

//#region Form (WHATWG #4.10)

export const form = (...argument_list) =>
  create_element('form', ...argument_list);

export const label = (...argument_list) =>
  create_element('label', ...argument_list);

export const input = (...argument_list) =>
  create_element('input', ...argument_list);

export const button = (...argument_list) =>
  create_element('button', ...argument_list);

export const select = (...argument_list) =>
  create_element('select', ...argument_list);

export const datalist = (...argument_list) =>
  create_element('datalist', ...argument_list);

export const optgroup = (...argument_list) =>
  create_element('optgroup', ...argument_list);

export const option = (...argument_list) =>
  create_element('option', ...argument_list);

export const textarea = (...argument_list) =>
  create_element('textarea', ...argument_list);

export const fieldset = (...argument_list) =>
  create_element('fieldset', ...argument_list);

export const legend = (...argument_list) =>
  create_element('legend', ...argument_list);

//#endregion
