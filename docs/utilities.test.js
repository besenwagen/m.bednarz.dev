import { result, suite } from './test.js';
import { callOrNothingAtAll } from './utilities.js';

const test = suite(import.meta);

export default result(test);

{
  const test_callOrNothingAtAll = test(callOrNothingAtAll);
  const increment = n => n + 1;

  test_callOrNothingAtAll
    ('falsy -> undefined', [
      callOrNothingAtAll(0, [
        increment, [
          41,
        ]]),
      undefined,
    ]);

  test_callOrNothingAtAll
    ('truthy -> return value', [
      callOrNothingAtAll('0', [
        increment, [
          41,
        ]]),
      42,
    ]);
}
