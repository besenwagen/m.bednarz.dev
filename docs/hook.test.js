import { result, suite } from './test.js'
import { hook, use_state } from './hook.js'

const test = suite(import.meta)

export default result(test)

const nil = () => undefined

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
  ('return the initial value',
    hook(() => {
      const [count] = use_state(0)
      return [
        count,
        0,
      ]
    }, nil))
  ('update the initial value',
    new Promise(resolve => {
      const hooked = hook(
        () => {
          const [count, set_count] = use_state(3)
          set_count(7)
          return count
        },
        () => undefined
      )
      resolve([
        [hooked(), hooked()].join(),
        '3,7',
      ])
    }))
  ('set implicitly executes the update callback',
    new Promise(resolve => {
      let call_count = 0
      const hooked = hook(
        () => {
          const [, set] = use_state()
          set()
        },
        () => {
          call_count++
        }
      )
      let repeat = 5
      while (repeat--) hooked()
      resolve([
        call_count,
        5,
      ])
    }))
