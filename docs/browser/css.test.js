import { result, suite } from '../test.js'
import { disposable } from './sandbox.js'
import {
  max_width,
  min_width,
  motion,
  style_sheet,
  to_css_text,
  to_rule_set,
} from './css.js'

const test = suite(import.meta)

export default result(test)

/* global getComputedStyle */

test(max_width)
  ('max-width media query', [
    max_width('42em'),
    '@media only screen and (max-width:42em)',
  ])

test(min_width)
  ('min-width media query', [
    min_width('42em'),
    '@media only screen and (min-width:42em)',
  ])

test(motion)
  ('reduced motion media query', [
    motion(),
    '@media only screen and (prefers-reduced-motion:no-preference)',
  ])

test(to_css_text)
  ('concatenate declarations', [
    to_css_text({
      color: 'red',
      display: 'flex',
    }),
    'color:red;display:flex',
  ])

test(to_rule_set)
  ('create ruleset', [
    to_rule_set('main > h1', {
      color: 'red',
      display: 'flex',
    }),
    'main > h1{color:red;display:flex}',
  ])

// Don't test resolved values that are different from used values here
// https://drafts.csswg.org/cssom/#resolved-values
test(style_sheet)
  ('insert multiple rule sets',
    disposable(({
      head,
      body,
      set,
    }) => {
      style_sheet({
        body: {
          display: 'flex',
        },
        h1: {
          textAlign: 'center',
        },
      }, head)
      set('<h1>Hello, CSS!</h1>')
      const body_style = getComputedStyle(body)
      const h1_style = getComputedStyle(body.firstChild)
      return [
        [body_style.display, h1_style.textAlign].join(),
        'flex,center',
      ]
    }))
  ('insert media query',
    disposable(({
      head,
      body,
    }) => {
      style_sheet({
        '@media only screen and (min-width: 1px)': {
          body: {
            fontSize: '100px',
          },
        },
      }, head)
      const body_style = getComputedStyle(body)
      return [
        body_style.fontSize,
        '100px',
      ]
    }))
