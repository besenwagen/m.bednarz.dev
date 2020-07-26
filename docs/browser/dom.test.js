import { result, suite } from '../test.js'
import {
  element_factory,
  select,
  to_fragment,
} from './dom.js'

const test = suite(import.meta)

export default result(test)

test(select)
  ('use the documentElement as default scope', [
    select(':scope > head > title')[0].firstChild.nodeValue,
    'Unit Tests | m.bednarz.nl',
  ])

test(to_fragment)
  ('create a DOM fragment from a string', [
    to_fragment(' <i></i> ').childNodes.length,
    3,
  ])

{
  const test_elementFactory = test(element_factory)
  const { a } = element_factory(['a'])
  {
    const link = a({
      href: '/',
    }, 'Hello, World!')

    test_elementFactory
      ('<a> children', [
        link
          .firstChild
          .nodeValue,
        'Hello, World!',
      ])

    test_elementFactory
      ('<a> attributes', [
        link.getAttribute('href'),
        '/',
      ])
  }
}
