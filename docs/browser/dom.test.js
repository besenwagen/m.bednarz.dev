import { result, suite } from '../test.js';
import {
  createElement,
  elementFactory,
  select,
  toFragment,
} from './dom.js';

const test = suite(import.meta);

export default result(test);

test(select)
  ('uses the documentElement as default scope', [
    select(':scope > head > title')[0].firstChild.nodeValue,
    'Test',
  ]);

test(toFragment)
  ('creates a DOM fragment from a string', [
    toFragment(' <i></i> ').childNodes.length,
    3,
  ]);

{
  const test_elementFactory = test(elementFactory);
  const {
    a,
    div,
    span,
  } = elementFactory(['div', 'a', 'span']);

  {
    const link = a({
      href: '/',
    }, 'Hello, World!');

    test_elementFactory
      ('<a> children', [
        link
          .firstChild
          .nodeValue,
        'Hello, World!',
      ]);

    test_elementFactory
      ('<a> attributes', [
        link.getAttribute('href'),
        '/',
      ]);
  }
}
