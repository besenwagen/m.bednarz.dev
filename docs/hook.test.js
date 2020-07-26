import { result, suite } from './test.js'
import { hook, use_state } from './hook.js'

const test = suite(import.meta)

export default result(test)

test(hook)
  ('return the wrapped function return value', () => {
    const foo = tail => `foo${tail}`
    const hooked = hook(foo)
    return [
      foo('bar'),
      hooked('bar'),
    ]
  })

test(use_state)
  ('set the initial state',
    hook(() => {
      const [state] = use_state('foobar')
      return [
        state,
        'foobar',
      ]
    }))
  ('handle multiple calls',
    hook(() => {
      const [fruit, set_fruit] = use_state('apple')
      const [cake, set_cake] = use_state('brownie')
      const [new_fruit, old_fruit] = set_fruit('orange')
      const [new_cake, old_cake] = set_cake('gingerbread')
      return [
        JSON.stringify([
          fruit, new_fruit, old_fruit,
          cake, new_cake, old_cake,
        ]),
        '["apple","orange","apple","brownie","gingerbread","brownie"]',
      ]
    }))
  ('state setter: return the current and previous state',
    hook(() => {
      const [state, set_state] = use_state(7)
      const tuple = set_state(state * 3)
      return [
        JSON.stringify(tuple),
        '[21,7]',
      ]
    }))
