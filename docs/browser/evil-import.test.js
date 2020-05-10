import { result, suite } from '../test.js'
import { evilImport } from './evil-import.js'

const test = suite(import.meta.url)

export default result(test)

test
  ('named export', () => {
    const literal = `
      const v = 41;
      const f = n => n + 1;

      export const result = f(v);
    `

    return evilImport(literal)
      .then(({ result }) => [
        result,
        42,
      ])
  })
  ('default export', () => {
    const literal = `
      const v = 41;
      const f = n => n + 1;

      export default f(v);
    `

    return evilImport(literal)
      .then(resolvedModule => [
        resolvedModule.default,
        42,
      ])
  })
