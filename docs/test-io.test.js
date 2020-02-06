import { result, suite } from './test.js'
import {
  jsonEscape,
  yamlify,
} from './test-io.js'

const test = suite(import.meta)

export default result(test)

const test_json_escape = test(jsonEscape)

test_json_escape
  ('double quotes', [
    jsonEscape('foo "bar" baz'),
    '"foo \\"bar\\" baz"',
  ])
  ('excess double quotes', [
    jsonEscape('"foo \\"bar\\" baz"'),
    '"foo \\"bar\\" baz"',
  ])

const test_yamlify = test(yamlify)

test_yamlify
  ('quotes all test case descriptions', [
    yamlify([
      ['moduleIdentifier', [
        ['testDescription', true, [true, true]],
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

test_yamlify
  ('quotes assertion string values', [
    yamlify([
      ['moduleIdentifier', [
        ['testDescription', true, ['foo "and" bar', 'foo "and" bar']],
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

test_yamlify
  ('escapes line breaks', [
    yamlify([
      ['moduleIdentifier', [
        ['testDescription', true, [
          `foo

bar`,
          `foo

bar`,
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
