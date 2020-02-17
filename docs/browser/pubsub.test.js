import { result, suite } from '../test.js'
import { publish, subscribe } from './pubsub.js'

const test = suite(import.meta)

export default result(test)

test
  ('subscribe', new Promise(resolve => {
    subscribe('foo:bar', value => {
      resolve([value, 42])
    })

    publish('foo:bar', 42)
  }))

test
  ('unsubscribe', () => {
    let state = 0

    function increment() {
      state += 1
    }

    const unsubscribe = subscribe('state:increment', increment)

    publish('state:increment')
    unsubscribe()
    publish('state:increment')

    return [state, 1]
  })

test
  ('immutable', new Promise(resolve => {
    const data = {
      answer: 42,
    }

    subscribe('foo:bar', value => {
      value.answer = 7;
      resolve([data.answer, 42])
    })

    publish('foo:bar', data)
  }))
