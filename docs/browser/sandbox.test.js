import { result, suite } from '../test.js'
import { run, sandbox } from './sandbox.js'

const test = suite(import.meta)

export default result(test)


test(run)
  ('`global` references a distinct host environment',
    run(({ global }) => [
      (global.Array === Array),
      false,
    ]))

test(run)
  ('`set()` sets the IFRAME BODY HTML',
    run(({ body, set }) => {
      set('<h1>Hello, world!</h1>')

      return [
        body.innerHTML,
        '<h1>Hello, world!</h1>',
      ]
    }))

test(run)
  ('`set()` replaces the existing IFRAME BODY HTML',
    run(({ body, set }) => {
      set('<h1>Hello, world!</h1>')
      set('<h1>Hello, again!</h1>')

      return [
        body.innerHTML,
        '<h1>Hello, again!</h1>',
      ]
    }))


test(run)
  ('`reset()` restores the initial document HTML',
    run(({ global, set, reset }) => {
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

{
  const count = () =>
    document
      .querySelectorAll('iframe')
      .length;

  test(sandbox)
    ('`destroy` the IFRAME from the main document',
      sandbox()
        .then(({ destroy }) => {
          const [before, , after] = [
            count(),
            destroy(),
            count(),
          ]

          return [(before - 1), after]
        }))
}
