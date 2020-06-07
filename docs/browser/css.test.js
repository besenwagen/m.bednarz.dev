import { result, suite } from '../test.js'
import { disposable } from './sandbox.js'
import {
  maxWidth,
  minWidth,
  motion,
  styleSheet,
  toCssText,
  toRuleSet,
} from './css.js'

const test = suite(import.meta)

export default result(test)

/* global getComputedStyle */

test(maxWidth)
  ('max-width media query', [
    maxWidth('42em'),
    '@media only screen and (max-width:42em)',
  ])

test(minWidth)
  ('min-width media query', [
    minWidth('42em'),
    '@media only screen and (min-width:42em)',
  ])

test(motion)
  ('reduced motion media query', [
    motion(),
    '@media only screen and (prefers-reduced-motion:no-preference)',
  ])

test(toCssText)
  ('concatenate declarations', [
    toCssText({
      color: 'red',
      display: 'flex',
    }),
    'color:red;display:flex',
  ])

test(toRuleSet)
  ('create ruleset', [
    toRuleSet('main > h1', {
      color: 'red',
      display: 'flex',
    }),
    'main > h1{color:red;display:flex}',
  ])

// Don't test resolved values that are different from used values here
// https://drafts.csswg.org/cssom/#resolved-values
test(styleSheet)
  ('insert multiple rule sets',
    disposable(({
      head,
      body,
      set,
    }) => {
      styleSheet({
        body: {
          display: 'flex',
        },
        h1: {
          textAlign: 'center',
        },
      }, head)
      set('<h1>Hello, CSS!</h1>')
      const bodyStyle = getComputedStyle(body)
      const h1Style = getComputedStyle(body.firstChild)
      return [
        [bodyStyle.display, h1Style.textAlign].join(),
        'flex,center',
      ]
    }))
  ('insert media query',
    disposable(({
      head,
      body,
    }) => {
      styleSheet({
        '@media only screen and (min-width: 1px)': {
          body: {
            fontSize: '100px',
          },
        },
      }, head)
      const bodyStyle = getComputedStyle(body)
      return [
        bodyStyle.fontSize,
        '100px',
      ]
    }))
