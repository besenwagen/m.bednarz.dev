import { result, suite } from '../test.js'
import { disposable } from './sandbox.js'
import {
  disable,
  force_id,
  with_id,
} from './aria.js'

const test = suite(import.meta)

export default result(test)

/* global document */

test(force_id)
  ('get the existing id attribute value, if any', () => {
    const element = document.createElement('div')
    element.id = 'fubar'
    return [
      force_id(element),
      'fubar',
    ]
  })
  ('set and get an id attribute value if none exists', () => {
    const element = document.createElement('div')
    return /^[a-z\d]+$/.test(force_id(element))
  })

test(with_id)
  ('create an id attribute value if none exists', () => {
    const element = document.createElement('div')
    return /^[a-z\d]+$/.test(with_id(element).id)
  })

{
  const test_disable = test(disable)

  test_disable('set aria-hidden on child elements',
    disposable(({ body, set }) => {
      const initial_html = `
        <div></div>
        <div aria-disabled="false"></div>
      `
      const result_html = `
        <div aria-disabled="true"></div>
        <div aria-disabled="true"></div>
      `
      set(initial_html)
      disable(body)
      return [body.innerHTML, result_html]
    }))

  test_disable('reset aria-hidden on child elements',
    disposable(({ body, set }) => {
      const initial = `
        <div></div>
        <div aria-disabled="false"></div>
 `
      set(initial)
      disable(body)()
      return [body.innerHTML, initial]
    }))
}
