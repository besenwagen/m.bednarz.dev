import { result, suite } from '../test.js'
import { storageContext } from './storage.js'
import { disposable } from './sandbox.js'

const test = suite(import.meta)

export default result(test)

test
  ('create a timestamp',
    disposable(({ global }) => {
      const key = `foo-${Date.now()}`
      const [read, write] = storageContext(global.sessionStorage)
      write(key, 'bar')
      const value = read(key, 60)
      global.sessionStorage.removeItem(key)
      return [
        value,
        'bar',
      ]
    }))

test
  ('expire after max age in seconds',
    disposable(({ global }) => {
      return new Promise(resolve => {
        const key = `foo-${Date.now()}`
        const [read, write] = storageContext(global.sessionStorage)
        write(key, 'bar')
        setTimeout(() => {
          const value = read(key, 1)
          global.sessionStorage.removeItem(key)
          resolve([
            value,
            null,
          ])
        }, 1500)
      })
    }))
