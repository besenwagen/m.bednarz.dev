/**
 * Copyright 2020 Eric Bednarz <https://m.bednarz.dev>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
export {
  disable,
  forceId,
  withId,
  labelWith,
  describeWith,
  relocate,
  svgAria,
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

//#region SVG

function setMissingAttribute(element, name, value) {
  if (!element.hasAttribute(name)) {
    element.setAttribute(name, value);
  }
}

function labelSvgWithDescription(root, title, description) {
  setMissingAttribute(description, 'id', unique());
  setMissingAttribute(root, 'aria-labelledby', [
    title.id,
    description.id,
  ].join(' '));
}

function annotateSvgRoot(root, title) {
  const description = root.querySelector('desc');

  setMissingAttribute(title, 'id', unique());

  if (description) {
    labelSvgWithDescription(root, title, description);
  } else {
    setMissingAttribute(root, 'aria-labelledby', title.id);
  }
}

function svgAria(svgElement) {
  const title = svgElement.querySelector('title');

  if (title) {
    setMissingAttribute(svgElement, 'role', 'img');
    annotateSvgRoot(svgElement, title);
  } else {
    setMissingAttribute(svgElement, 'aria-hidden', 'true');
  }
}

//#endregion

function relocate(element) {
  function blur() {
    element.removeAttribute('tabindex');
    element.removeEventListener('blur', blur, false);
  }

  element.setAttribute('tabindex', '0');
  element.addEventListener('blur', blur, false);
  element.focus();
}
