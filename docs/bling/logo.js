import { SVG_SYMBOLS } from './initialize.js';
import { resource } from '/browser/resource.js';
import { select, toFragment } from '/browser/dom.js';
import { useSymbol } from '/browser/svg.js';

/* global document */

function setLogo(id) {
  const [placeholder] = select('.placeholder');
  const symbol = useSymbol(id);

  placeholder.appendChild(symbol);
  placeholder.classList.remove('loading');

  return placeholder;
}

resource(SVG_SYMBOLS)
  .then(svgLiteral => toFragment(svgLiteral))
  .then(function render(symbols) {
    const { body } = document;

    body.appendChild(symbols);
    setLogo('logomark');
  });
