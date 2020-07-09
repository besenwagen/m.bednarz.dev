import { suite, result } from './test.js'
import {
  queue,
  enqueue,
  dequeue,
  peek,
} from './queue.js'

const test = suite(import.meta)

export default result(test)

test
  ('First in, first out', () => {
    const [schedule, select] = queue(enqueue, dequeue)
    schedule('Hello')
    schedule('World')
    return [
      select(),
      'Hello',
    ]
  })
  ('Last in, last out', () => {
    const [schedule, select] = queue(enqueue, dequeue)
    schedule('Hello')
    schedule('World')
    select()
    return [
      select(),
      'World',
    ]
  })

test(queue)
  ('Return an array with the length of the passed arguments', [
    queue(enqueue, dequeue).length,
    2,
  ])
  ('without arguments', () => {
    const list = queue()
    enqueue(list, 'Hello')
    return [
      dequeue(list),
      'Hello',
    ]
  })
  ('without arguments empty', () => {
    const list = queue()
    enqueue(list, 'Hello')
    dequeue(list)
    return [
      dequeue(list),
      undefined,
    ]
  })

test(enqueue)
  ('Return the queue size', () => {
    const [schedule] = queue(enqueue)
    schedule('FOO')
    return [
      schedule('BAR'),
      2,
    ]
  })

test(dequeue)
  ('Return the current head value', () => {
    const [schedule, select] = queue(enqueue, dequeue)
    schedule('FOO')
    return [
      select('FOO'),
      'FOO',
    ]
  })
  ('Return `undefined` if the queue is empty', () => {
    const [select] = queue(dequeue)
    return [
      select(),
      undefined,
    ]
  })
  ('Remove the queue head', () => {
    const [schedule, select] = queue(enqueue, dequeue, peek)
    schedule('FOO')
    schedule('BAR')
    select()
    return [
      select(),
      'BAR',
    ]
  })
  ('Decrement the queue size', () => {
    const [schedule, select] = queue(enqueue, dequeue)
    schedule('FOO')
    schedule('BAR')
    select()
    return [
      schedule('BAZ'),
      2,
    ]
  })

test(peek)
  ('Return the current head value', () => {
    const [schedule, inspect] = queue(enqueue, peek)
    schedule('FOO')
    return [
      inspect(),
      'FOO',
    ]
  })
  ('Return `undefined` if the queue is empty', () => {
    const [inspect] = queue(peek)
    return [
      inspect(),
      undefined,
    ]
  })
  ('Do not remove the queue head', () => {
    const [schedule, select, inspect] = queue(enqueue, dequeue, peek)
    schedule('FOO')
    inspect()
    return [
      select(),
      'FOO',
    ]
  })
  ('Do not decrement the queue size', () => {
    const [schedule, inspect] = queue(enqueue, peek)
    schedule('FOO')
    inspect()
    return [
      schedule('BAR'),
      2,
    ]
  })
