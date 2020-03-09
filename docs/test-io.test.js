import { result, suite } from './test.js'
import {
  _jsonEscape as jsonEscape,
  _yamlify as yamlify,
} from './test-io.js'

const test = suite(import.meta)

export default result(test)

test(jsonEscape)
  ('escape double quotes', [
    jsonEscape('foo "bar" baz'),
    '"foo \\"bar\\" baz"',
  ])
  ('ignore valid json string values', [
    jsonEscape('"foo \\"bar\\" baz"'),
    '"foo \\"bar\\" baz"',
  ])

test(yamlify)
  ('quote all test case descriptions', [
    yamlify([
      ['moduleIdentifier', [
        ['testDescription', true, [
          ['boolean', true],
          ['boolean', true],
        ]],
      ]],
    ]),
    [
      '  moduleIdentifier:',
      '    "testDescription":',
      '      actual:',
      '        boolean: true',
      '      expected:',
      '        boolean: true',
    ].join('\n'),
  ])
  ('quote assertion string values', [
    yamlify([
      ['moduleIdentifier', [
        ['testDescription', true, [
          ['string', 'foo "and" bar'],
          ['string', 'foo "and" bar'],
        ]],
      ]],
    ]),
    [
      '  moduleIdentifier:',
      '    "testDescription":',
      '      actual:',
      '        string: "foo \\"and\\" bar"',
      '      expected:',
      '        string: "foo \\"and\\" bar"',
    ].join('\n'),
  ])
  ('escape line breaks', [
    yamlify([
      ['moduleIdentifier', [
        ['testDescription', true, [
          ['string', `foo

bar`],
          ['string', `foo

bar`],
        ]],
      ]],
    ]),
    [
      '  moduleIdentifier:',
      '    "testDescription":',
      '      actual:',
      '        string: "foo\\n\\nbar"',
      '      expected:',
      '        string: "foo\\n\\nbar"',
    ].join('\n'),
  ])
