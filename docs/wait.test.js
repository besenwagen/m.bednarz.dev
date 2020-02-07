import { result, suite } from './test.js'
import { wait } from './wait.js'

const test = suite(import.meta)

export default result(test)

test
  ('resolves after the delay', () => {
    const start = Number(new Date())

    return wait(500)
      .then(() => {
        const elapsed = Number(new Date()) - start

        return (elapsed >= 500)
      })
  })
