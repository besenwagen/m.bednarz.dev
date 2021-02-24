import { result, suite } from '../test.js'
import {
  _mangle_imports as mangle_imports,
  _parse as parse,
} from './vue-loader.js'

const test = suite(import.meta.url)

export default result(test)

const { origin } = window.location
const ID = '$MONKEY_PATCH$'

test(parse)
  ('script literal', () => {
    const expected = 'export default {}';
    const source = `<script>${expected}</script>`
    const { script } = parse(source, origin, origin)
    return [
      script,
      expected,
    ]
  })
  ('template literal', () => {
    const expected = '<div>FOOBAR</div>'
    const source = `<template>${expected}</template>`
    const { template } = parse(source, origin, origin)
    return [
      template,
      expected,
    ]
  })
  ('style element node', () => {
    const expected = ':root{}'
    const source = `<style>${expected}</style>`
    const {
      style: {
        textContent,
      },
    } = parse(source, origin, origin)
    return [
      textContent,
      expected,
    ]
  })

test(mangle_imports)
  ('no-op', () => {
    const expected = 'export default {}'
    return [
      mangle_imports(expected, origin, origin),
      expected,
    ]
  })
  ('SFC import', () => {
    const source = 'import FooBar from "./foobar.vue"'
    const expected = [
      `import ${ID} from '${origin}';`,
      `const FooBar = ${ID}('${origin}/foobar.vue');`,
    ].join('\n')
    return [
      mangle_imports(source, origin, origin),
      expected,
    ]
  })
  ('ES named import', () => {
    const source = 'import { FooBar } from "./foobar.js"'
    const expected = `import { FooBar } from '${origin}/foobar.js';`
    return [
      mangle_imports(source, origin, origin),
      expected,
    ]
  })
  ('ES default import', () => {
    const source = 'import FooBar from "./foobar.js"'
    const expected = `import FooBar from '${origin}/foobar.js';`
    return [
      mangle_imports(source, origin, origin),
      expected,
    ]
  })
  ('SFC imports with mixed quote and semi style', () => {
    const source = [
      'import Foo from "./foo.vue"',
      "import Bar from './bar.vue'",
    ].join('\n')
    const expected = [
      `import ${ID} from '${origin}';`,
      `const Foo = ${ID}('${origin}/foo.vue');`,
      `const Bar = ${ID}('${origin}/bar.vue');`,
    ].join('\n')
    return [
      mangle_imports(source, origin, origin),
      expected,
    ]
  })
  ('ES named imports with mixed quote and semi style', () => {
    const source = [
      "import { Foo } from './foo.js'",
      'import { Bar } from "./bar.js";',
    ].join('\n')
    const expected = [
      `import { Foo } from '${origin}/foo.js';`,
      `import { Bar } from '${origin}/bar.js';`,
    ].join('\n')
    return [
      mangle_imports(source, origin, origin),
      expected,
    ]
  })
  ('ES multiline imports', () => {
    const source = [
      'import {',
      '  Foo,',
      '  Bar,',
      "} from './foobar.js'",
    ].join('\n')
    const expected = [
      'import {',
      '  Foo,',
      '  Bar,',
      `} from '${origin}/foobar.js';`,
    ].join('\n')
    return [
      mangle_imports(source, origin, origin),
      expected,
    ]
  })
  ('Everything combined', () => {
    const source = [
      "import { FooJs } from './foo.js';",
      'import FooVue from "./foo.vue"',
      'import { BarJs } from "./bar.js";',
      "import BarVue from './bar.vue'",
    ].join('\n')
    const expected = [
      `import ${ID} from '${origin}';`,
      `import { FooJs } from '${origin}/foo.js';`,
      `const FooVue = ${ID}('${origin}/foo.vue');`,
      `import { BarJs } from '${origin}/bar.js';`,
      `const BarVue = ${ID}('${origin}/bar.vue');`,
    ].join('\n')
    return [
      mangle_imports(source, origin, origin),
      expected,
    ]
  })
