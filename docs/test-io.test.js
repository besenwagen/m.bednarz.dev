import { result, suite } from './test.js';
import {
  jsonEscape,
  yamlify,
} from './test-io.js';

const test = suite(import.meta);

export default result(test);

test(jsonEscape)
  ('double quotes', [
    jsonEscape('foo "bar" baz'),
    '"foo \\"bar\\" baz"',
  ])
  ;

const test_yamlify = test(yamlify);

test_yamlify
  ('quotes all test case descriptions', [
    yamlify([
      ['moduleIdentifier', [
        ['test1', true, [true, true]],
      ]],
    ]),
    [
      '  moduleIdentifier:',
      '    "test1":',
      '      actual:',
      '        boolean: true',
      '      expected:',
      '        boolean: true',
    ].join('\n'),
  ]);

test_yamlify
  ('quotes assertion string values', [
    yamlify([
      ['moduleIdentifier', [
        ['test1', true, ['foo "and" bar', 'foo "and" bar']],
      ]],
    ]),
    [
      '  moduleIdentifier:',
      '    "test1":',
      '      actual:',
      '        string: "foo \\"and\\" bar"',
      '      expected:',
      '        string: "foo \\"and\\" bar"',
    ].join('\n'),
  ]);
