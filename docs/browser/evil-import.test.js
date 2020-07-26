import { result, suite } from '../test.js'
import {
  evil_import,
} from './evil-import.js'

const test = suite(import.meta.url)

export default result(test)

test
  ('named export', () => {
    const literal = `
      const v = 41;
      const f = n => n + 1;

      export const value = f(v);
    `

    return evil_import(literal)
      .then(({ value }) => [
        value,
        42,
      ])
  })
  ('default export', () => {
    const literal = `
      const v = 41;
      const f = n => n + 1;

      export default f(v);
    `

    return evil_import(literal)
      .then(resolved_module => [
        resolved_module.default,
        42,
      ])
  })
