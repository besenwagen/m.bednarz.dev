import { result, suite } from './test.js';
import { hook, useState } from './hook.js';

const test = suite(import.meta);

export default result(test);

test(hook)

  ('return the wrapped function return value', () => {
    const foo = tail => `foo${tail}`
    const hooked = hook(foo)

    return [
      foo('bar'),
      hooked('bar'),
    ]
  })

test(useState)

  ('set the initial state', hook(() => {
    const [state] = useState('foobar');

    return [
      state,
      'foobar',
    ]
  }))

  ('handle multiple calls', hook(() => {
    const [fruit, setFruit] = useState('apple')
    const [cake, setCake] = useState('brownie')

    const [newFruit, oldFruit] = setFruit('orange');
    const [newCake, oldCake] = setCake('gingerbread');

    return [
      JSON.stringify([
        fruit, newFruit, oldFruit,
        cake, newCake, oldCake,
      ]),
      '["apple","orange","apple","brownie","gingerbread","brownie"]',
    ]
  }))

  ('state setter: return the current and previous state',
    hook(() => {
      const [state, setState] = useState(7);
      const tuple = setState(state * 3);

      return [
        JSON.stringify(tuple),
        '[21,7]',
      ]
    }))
