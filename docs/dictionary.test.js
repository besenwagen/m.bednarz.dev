import { result, suite } from './test.js';
import { dictionary } from './dictionary.js';

const test = suite(import.meta);

test
  ('the stringTag of a dictionary is Dictionary', [
    Object
      .prototype
      .toString
      .call(dictionary({})),
    '[object Dictionary]',
  ]);

test
  ('a dictionary has no constructor', [
    dictionary({}).constructor,
    undefined,
  ]);

test
  ('a dictionary has no prototype', [
    dictionary({}).prototype,
    undefined,
  ]);

export default result(test);
