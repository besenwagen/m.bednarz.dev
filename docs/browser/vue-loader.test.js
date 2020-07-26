import { result, suite } from '../test.js'
import { load_component } from './vue-loader.js'
import { resolve_blob_url } from './url.js'

const test = suite(import.meta.url)

export default result(test)

test('template string', () => {
  const source = `
    <template><div></div></template>
    <script>
    export default {};
    </script>
  `
  return resolve_blob_url(load_component, source, 'text/html')
    .then(({ template }) => [
      template,
      '<div></div>',
    ])
})
