import { promise, scope, suite } from '../test.js';
import {
  select,
  toFragment,
} from './dom.js';

const test = suite(import.meta);

scope(test, select)

  ('uses the documentElement as default scope', [
    select(':scope > head > title')[0].firstChild.nodeValue,
    'Test',
  ])

  ;

scope(test, toFragment)

  ('creates a DOM fragment from a string', [
    toFragment(' <i></i> ').childNodes.length,
    3,
  ])

  ;

export default promise(test);
