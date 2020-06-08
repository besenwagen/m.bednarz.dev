import { result, suite } from '../test.js'
import { loadComponent } from './vue-loader.js'
import { resolveBlobUrl } from './url.js'

const test = suite(import.meta.url)

export default result(test)

{
  const source = `
<template><div></div></template>
<script>
export default {};
</script>
  `
  const type = 'text/html'

  test('template string',
    resolveBlobUrl(loadComponent, source, type)
      .then(({ template }) => [
        template,
        '<div></div>',
      ])
  )
}
