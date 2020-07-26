import { result, suite } from '../test.js'
import { to_blob_url, resolve_blob_url } from './url.js'

const test = suite(import.meta)

export default result(test)

/* global location */

test(to_blob_url)
  ('create an object URL',
    new RegExp(`^blob:${location.origin}/`)
      .test(to_blob_url('hello', 'application/javascript')))

test(resolve_blob_url)
  ('resolve a dynamic import',
    resolve_blob_url(
      url => import(url),
      'export default 42',
      'application/javascript'
    )
      .then(module => [
        module.default,
        42,
      ])
  )
