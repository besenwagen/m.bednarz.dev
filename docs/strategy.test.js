import { result, suite } from './test.js'
import { strategy } from './strategy.js'

const test = suite(import.meta)

export default result(test)

test
  ('no match: resolve undefined',
    () => {
      const resolve = strategy({})
      return [
        resolve('BAR'),
        undefined,
      ]
    })
  ('no match: resolve the default value',
    () => {
      const resolve = strategy({}, 'FOO')
      return [
        resolve('BAR'),
        'FOO',
      ]
    })
  ('object match: resolve the static value',
    () => {
      const resolve = strategy({
        FOO: 'BAR',
      })
      return [
        resolve('FOO'),
        'BAR',
      ]
    })
  ('object match: resolve the dynamic value',
    () => {
      const resolve = strategy({
        FOO() {
          return 'BAR'
        },
      })
      return [
        resolve('FOO'),
        'BAR',
      ]
    })
  ('object collection: do not match prototype properties',
    () => {
      const resolve = strategy(Object.create({
        FOO: 'BAR',
      }))
      return [
        resolve('FOO'),
        undefined,
      ]
    })
  ('array collection: do not match prototype properties',
    () => {
      // TODO: need a sandbox without browser DOM
      // eslint-disable-next-line
      Array.prototype['1'] = 'FUBAR'
      const resolve = strategy(['FOO'])
      const match = resolve(1)
      delete Array.prototype['1']
      return [
        match,
        undefined,
      ]
    })
  ('array collection: match positive integers',
    () => {
      const resolve = strategy(['FOO', 'BAR'])
      return [
        resolve(1),
        'BAR',
      ]
    })
  ('array collection: match numeric strings',
    () => {
      const resolve = strategy(['FOO', 'BAR'])
      return [
        resolve('1'),
        'BAR',
      ]
    })
  ('array collection: do not match padded zeros',
    () => {
      const resolve = strategy(['FOO', 'BAR'])
      return [
        resolve('01'),
        undefined,
      ]
    })
  ('array collection: do not match the length property',
    () => {
      const resolve = strategy(['FOO'])
      return [
        resolve('length'),
        undefined,
      ]
    })
  ('object collection: match a length property',
    () => {
      const resolve = strategy({
        length: 'FOO',
      })
      return [
        resolve('length'),
        'FOO',
      ]
    })
