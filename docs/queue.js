export {
  queue,
  enqueue,
  dequeue,
  peek,
};

import { partial } from './functional.js';

const bucket = new Map();

//#region Creators

const createCollection = () => ({
  head: null,
  tail: null,
  size: 0,
});

const createNode = value => ({
  next: null,
  value,
});

//#endregion

//#region State mutators

function add(collection, node) {
  if (collection.tail) {
    collection.tail.next = node;
  } else {
    collection.head = node;
  }

  collection.tail = node;
  collection.size += 1;
}

function remove(collection, next) {
  if (next) {
    collection.head = next;
  } else {
    collection.head = null;
    collection.tail = null;
  }

  collection.size -= 1;
}

//#endregion

function partiallyApply(key, api) {
  const toKeyMap = callback =>
    partial(callback, key);

  return api.map(toKeyMap);
}

//#region Public API

function queue(...api) {
  const key = Symbol('QUEUE');

  bucket.set(key, createCollection());

  if (api.length) {
    return partiallyApply(key, api);
  }

  return key;
}

function enqueue(key, value) {
  const collection = bucket.get(key);
  const node = createNode(value);

  add(collection, node);

  return collection.size;
}

function dequeue(key) {
  const collection = bucket.get(key);

  if (collection.head) {
    const {
      head: {
        next,
        value,
      },
    } = collection;

    remove(collection, next);

    return value;
  }
}

function peek(key) {
  const { head } = bucket.get(key);

  if (head) {
    return head.value;
  }
}

//#endregion
