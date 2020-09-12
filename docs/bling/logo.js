import { SVG_SYMBOLS } from './initialize.js';
import { resource } from '/browser/resource.js';
import { select, to_fragment } from '/browser/dom.js';
import { use_symbol } from '/browser/svg.js';

/* global document */

function set_logo(id) {
  const [placeholder] = select('.placeholder');
  const symbol = use_symbol(id);

  placeholder.appendChild(symbol);
  placeholder.classList.remove('loading');

  return placeholder;
}

resource(SVG_SYMBOLS)
  .then(svg_literal => to_fragment(svg_literal))
  .then(function render(symbols) {
    const { body } = document;

    body.appendChild(symbols);
    set_logo('logomark');
  });
