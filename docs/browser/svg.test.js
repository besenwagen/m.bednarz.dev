import { result, suite } from '../test.js'
import { create_element, use_symbol } from './svg.js'

const test = suite(import.meta)

export default result(test)

/* global SVGElement */

test(create_element)
  ('create an SVGElement instance',
    create_element('rect') instanceof SVGElement)
  ('coerce attribute values to strings', () => {
    const element = create_element('rect', {
      width: 100,
    })
    return [
      element.getAttribute('width'),
      '100',
    ]
  })

test(use_symbol)
  ('create an SVGSVGElement instance', [
    use_symbol('foo').constructor.name,
    'SVGSVGElement',
  ])
