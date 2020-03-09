import { result, suite } from '../test.js'
import { memory, network, resource } from './resource.js'

const test = suite(import.meta);

export default result(test)

test(memory)
  ('return an array of symbols', () => {
    const [foo] = memory({ 'foo': [] })
    return [
      typeof foo,
      'symbol',
    ]
  })

test(network)
  ('return an array of symbols', () => {
    const [foo] = network({ 'foo': [] })
    return [
      typeof foo,
      'symbol',
    ]
  })

test(resource)
  ('reject string id type',
    new Promise(resolve => {
      return resource('fubar')
        .catch(reason => resolve(reason instanceof TypeError))
    }))
  ('reject unknown resource id',
    new Promise(resolve => {
      return resource(Symbol('fubar'))
        .catch(reason => resolve(reason instanceof Error))
    }))
