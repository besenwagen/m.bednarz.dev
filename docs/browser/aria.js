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

/**
 * @param {HTMLElement} element
 * @returns {HTMLElement}
 */
function withId(element) {
  if (element.id) {
    return element;
  }

  return assign(element, {
    id: unique(),
  });
}

/**
 * @param {HTMLElement} element
 * @returns {string}
 */
function forceId(element) {
  const { id } = element;

  if (id) {
    return id;
  }

  return withId(element).id;
}

/**
 * @param {HTMLElement} element
 * @returns {string}
 */
const toId = element => forceId(element);

/**
 * @param {HTMLElement} source
 * @returns {string}
 */
const toTokenList = source =>
  source
    .map(toId)
    .join(' ');

/**
 * @param {HTMLElement|HTMLElement[]} source
 * @returns {string}
 */
function getValue(source) {
  if (isArray(source)) {
    return toTokenList(source);
  }

  return toId(source);
}

/**
 * @param {HTMLElement} target
 * @param {string} name
 * @param {HTMLElement|HTMLELement[]} source
 * @returns {HTMLElement}
 */
function connectById(target, name, source) {
  const value = getValue(source);

  target.setAttribute(name, value);

  return target;
}

/**
 * @param {HTMLElement} target
 * @param {HTMLElement} source
 * @returns {HTMLElement}
 */
const labelWith = (target, source) =>
  connectById(target, 'aria-labelledby', source);

/**
 * @param {HTMLElement} target
 * @param {HTMLElement} source
 * @returns {HTMLElement}
 */
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

/**
 * @param {HTMLELement} [contextNode=document.body]
 * @returns {function}
 */
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
