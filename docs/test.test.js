import { promise, suite } from './test.js';

const test = suite(import.meta);

test('expression', void 0 === undefined);

test('array', [void 0, undefined]);

test('promise -> expression', new Promise(resolve => {
  setTimeout(() => resolve(void 0 === undefined), 500);
}));

test('promise -> array', new Promise(resolve => {
  setTimeout(() => resolve([void 0, undefined]), 500);
}));

test('function -> expression', () => {
  return void 0 === undefined;
});

test('function -> array', () => {
  return [void 0, undefined];
});

test('function -> promise -> expression', () => {
  return new Promise(resolve => {
    setTimeout(() => resolve(void 0 === undefined), 500);
  });
});

test('function -> promise -> array', () => {
  return new Promise(resolve => {
    setTimeout(() => resolve([void 0, undefined]), 500);
  });
});

export default promise(test);
