/**
 * Copyright 2020 Eric Bednarz <https://m.bednarz.dev>
 * SPDX-License-Identifier: EUPL-1.2
 */
export {
  queue,
  enqueue,
  dequeue,
  peek,
  size,
};

import { partial } from './functional.js';

const bucket = new Map();

//#region Creators

const create_collection = () => ({
  head: null,
  tail: null,
  size: 0,
});

const create_node = value => ({
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

function partially_apply(key, api) {
  const to_key_map = callback =>
    partial(callback, key);

  return api.map(to_key_map);
}

//#region Public API

function queue(...api) {
  const key = Symbol('QUEUE');

  bucket.set(key, create_collection());

  if (api.length) {
    return partially_apply(key, api);
  }

  return key;
}

function enqueue(key, value) {
  const collection = bucket.get(key);
  const node = create_node(value);

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

const size = key =>
  bucket
    .get(key)
    .size;

//#endregion
