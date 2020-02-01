import { result, suite } from '../test.js';
import {
  select,
  toFragment,
} from './dom.js';

const test = suite(import.meta);

test(select)
  ('uses the documentElement as default scope', [
    select(':scope > head > title')[0].firstChild.nodeValue,
    'Test',
  ])
  ;

test(toFragment)
  ('creates a DOM fragment from a string', [
    toFragment(' <i></i> ').childNodes.length,
    3,
  ])
  ;

export default result(test);
