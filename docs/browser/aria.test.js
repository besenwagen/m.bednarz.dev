import { result, suite } from '../test.js'
import { disposable } from './sandbox.js'
import {
  disable,
  forceId,
  withId,
} from './aria.js'

const test = suite(import.meta)

export default result(test)

/* global document */

test(forceId)
  ('get the existing id attribute value, if any', () => {
    const element = document.createElement('div')
    element.id = 'fubar'
    return [
      forceId(element),
      'fubar',
    ]
  })
  ('set and get an id attribute value if none exists', () => {
    const element = document.createElement('div')
    return /^[a-z\d]+$/.test(forceId(element))
  })

test(withId)
  ('create an id attribute value if none exists', () => {
    const element = document.createElement('div')
    return /^[a-z\d]+$/.test(withId(element).id)
  })

{
  const test_disable = test(disable)

  test_disable('set aria-hidden on child elements',
    disposable(({ body, set }) => {
      const initialHtml = `
        <div></div>
        <div aria-disabled="false"></div>
      `
      const resultHtml = `
        <div aria-disabled="true"></div>
        <div aria-disabled="true"></div>
      `
      set(initialHtml)
      disable(body)
      return [body.innerHTML, resultHtml]
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
