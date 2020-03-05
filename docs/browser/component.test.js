import { result, suite } from '../test.js'
import {
  defineComponents,
  getAttributeObserverName,
  getComponentName,
  withAttributes,
} from './component.js'

const test = suite(import.meta)

export default result(test)

test(getComponentName)

  ('parse constructor with two humps', [
    getComponentName(function FooBar() { }),
    'foo-bar',
  ])

  ('parse constructor with more than two humps', [
    getComponentName(function FooBarBaz() { }),
    'foo-bar-baz',
  ])

  ('throw on constructor with no humps', () => {
    try {
      getComponentName(function Foo() { });

      return false;
    } catch ({ message }) {
      return [
        message,
        'Foo is not a valid identifier'
      ];
    }
  })

test(getAttributeObserverName)

  ('parse attribute name with no dash', [
    getAttributeObserverName('foo'),
    'onFooChange'
  ])

  ('parse attribute name with one dash', [
    getAttributeObserverName('foo-bar'),
    'onFooBarChange'
  ])

  ('parse attribute name with multiple dashes', [
    getAttributeObserverName('foo-bar-quux'),
    'onFooBarQuuxChange'
  ])
