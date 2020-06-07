import { result, suite } from '../test.js'
import { disposable, sandbox } from './sandbox.js'

const test = suite(import.meta)

export default result(test)

/* global document */

test(disposable)
  ('global: reference a distinct host environment',
    disposable(({ global }) => [
      (global.Array === Array),
      false,
    ]))
  ('set(): set the IFRAME BODY HTML',
    disposable(({ body, set }) => {
      set('<h1>Hello, world!</h1>')
      return [
        body.innerHTML,
        '<h1>Hello, world!</h1>',
      ]
    }))
  ('set(): replace the existing IFRAME BODY HTML',
    disposable(({ body, set }) => {
      set('<h1>Hello, world!</h1>')
      set('<h1>Hello, again!</h1>')
      return [
        body.innerHTML,
        '<h1>Hello, again!</h1>',
      ]
    }))
  ('reset(): restore the initial document HTML',
    disposable(({ global, set, reset }) => {
      set('<h1>FUBAR</h1>')
      global.document.title = 'FUBAR'
      reset()
      return [
        global.document.documentElement.outerHTML,
        [
          '<html><head>',
          '  <title></title>',
          '</head>',
          '<body>',
          '</body></html>',
        ].join('\n'),
      ]
    }))

test(sandbox)
  ('destroy(): remove the IFRAME from the main document',
    sandbox()
      .then(({ destroy }) => {
        const count = () =>
          document
            .querySelectorAll('iframe')
            .length
        const [before, , after] = [
          count(),
          destroy(),
          count(),
        ]
        return [(before - 1), after]
      }))
