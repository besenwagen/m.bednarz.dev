export {
  disable,
  forceId,
  withId,
  labelWith,
  describeWith,
};

import { unique } from '../utilities.js';

/* global document */

const { from, isArray } = Array;
const { assign } = Object;

function withId(element) {
  if (element.id) {
    return element;
  }

  return assign(element, {
    id: unique(),
  });
}

function forceId(element) {
  const { id } = element;

  if (id) {
    return id;
  }

  return withId(element).id;
}

const toId = element => forceId(element);

const toTokenList = source =>
  source
    .map(toId)
    .join(' ');

function getValue(source) {
  if (isArray(source)) {
    return toTokenList(source);
  }

  return toId(source);
}

function connectById(target, name, source) {
  const value = getValue(source);

  target.setAttribute(name, value);

  return target;
}

const labelWith = (target, source) =>
  connectById(target, 'aria-labelledby', source);

const describeWith = (target, source) =>
  connectById(target, 'aria-describedby', source);

//#region aria-disabled

const ATTRIBUTE_DISABLED = 'aria-disabled';

function mutateQueue(queue, callback) {
  for (const element of queue) {
    callback(element);
  }

  return queue;
}

function disableElement(element) {
  element.setAttribute(ATTRIBUTE_DISABLED, 'true');

  return element;
}

function enableImplicitly(element) {
  element.removeAttribute(ATTRIBUTE_DISABLED);

  return element;
}

function enableExplicitly(element) {
  element.setAttribute(ATTRIBUTE_DISABLED, 'false');

  return element;
}

const isImplicitlyEnabled = element =>
  !element
    .hasAttribute(ATTRIBUTE_DISABLED);

const isExplicitlyEnabled = element =>
  element
    .getAttribute(ATTRIBUTE_DISABLED) === 'false';

function disableSubset(queue, filter) {
  const subset = queue.filter(filter);

  return mutateQueue(subset, disableElement);
}

function disable(contextNode = document.body) {
  const queue = from(contextNode.children);

  const toSubset = callback =>
    disableSubset(queue, callback);

  const [added, toggled] = [
    isImplicitlyEnabled,
    isExplicitlyEnabled,
  ].map(toSubset);

  return function resetDisabled() {
    mutateQueue(added, enableImplicitly);
    mutateQueue(toggled, enableExplicitly);
  };
}

//#endregion
