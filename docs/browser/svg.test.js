import { result, suite } from '../test.js'
import { createElement, useSymbol } from './svg.js'

const test = suite(import.meta)

export default result(test)

/* global SVGElement */

test(createElement)
  ('creates an SVGElement instance',
    createElement('rect') instanceof SVGElement)
  ('coerces attribute values to strings',
    () => {
      const element = createElement('rect', {
        width: 100,
      })

      return [
        element.getAttribute('width'),
        '100',
      ]
    })

test(useSymbol)
  ('creates an SVGSVGElement instance', [
    useSymbol('foo').constructor.name,
    'SVGSVGElement',
  ])
