import { suite, result } from 'https://m.bednarz.dev/test.js';

const test = suite(import.meta);

export default result(test);

test('The truth is out there', true);
