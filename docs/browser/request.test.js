import { result, suite } from '../test.js'
import { json } from './request.js'

const test = suite(import.meta)

export default result(test)

{
  const { origin, pathname } = document.location
  const jsonUrl = [origin, pathname, 'stub.json'].join('/')
  let count = 0

  test(json)
    ('get JSON response', () => {
      const url = [jsonUrl, ++count].join('?')
      return json(url)
        .then(({ answer }) => {
          return [
            answer,
            42,
          ]
        })
        .catch(error => {
          console.error(error)
          return false
        })
    })
    ('throw on concurrent calls', () => {
      const url = [jsonUrl, ++count].join('?')
      return Promise
        .all([
          json(url),
          json(url),
        ])
        .then(() => {
          return false
        })
        .catch(({ message }) => {
          return [
            message,
            `Concurrent unsettled request: GET ${url}`,
          ]
        })
    })
}
