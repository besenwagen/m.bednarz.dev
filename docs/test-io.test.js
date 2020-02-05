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

test(yamlify)
  ('quotes all test case descriptions and values', [
    yamlify([
      ['moduleIdentifier', [
        ['test1', [true, true]],
      ]],
    ]),
    [
      '  moduleIdentifier:',
      '    "test1":',
      '      actual:',
      '        boolean: "true"',
      '      expected:',
      '        boolean: "true"',
    ].join('\n'),
  ]);
