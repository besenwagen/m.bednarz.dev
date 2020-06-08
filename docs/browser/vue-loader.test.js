import { result, suite } from '../test.js'
import { loadComponent } from './vue-loader.js'
import { resolveBlobUrl } from './url.js'

const test = suite(import.meta.url)

export default result(test)

test('template string', () => {
  const source = `
    <template><div></div></template>
    <script>
    export default {};
    </script>
  `
  return resolveBlobUrl(loadComponent, source, 'text/html')
    .then(({ template }) => [
      template,
      '<div></div>',
    ])
})
