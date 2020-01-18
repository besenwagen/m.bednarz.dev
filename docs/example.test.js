import { promise, suite } from './test.js';
import { example } from './example.js';

const test = suite(import.meta);

test('passing test example: exports a string', [
  (typeof example),
  'string',
]);

test('failing test example: exports a string', [
  (typeof example),
  'number',
]);

export default promise(test);
