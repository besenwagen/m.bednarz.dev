/**
 * Copyright 2020 Eric Bednarz <https://m.bednarz.dev>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
export {
  disable,
  force_id,
  with_id,
  label_with,
  describe_with,
  relocate,
  svg_aria,
};

import { unique } from '../utilities.js';

/* global document */

const { from, isArray } = Array;
const { assign } = Object;

function with_id(element) {
  if (element.id) {
    return element;
  }

  return assign(element, {
    id: unique(),
  });
}

function force_id(element) {
  const { id } = element;

  if (id) {
    return id;
  }

  return with_id(element).id;
}

const to_id = element => force_id(element);

const to_token_list = source =>
  source
    .map(to_id)
    .join(' ');

function get_value(source) {
  if (isArray(source)) {
    return to_token_list(source);
  }

  return to_id(source);
}

function connect_by_id(target, name, source) {
  const value = get_value(source);

  target.setAttribute(name, value);

  return target;
}

const label_with = (target, source) =>
  connect_by_id(target, 'aria-labelledby', source);

const describe_with = (target, source) =>
  connect_by_id(target, 'aria-describedby', source);

//#region aria-disabled

const ATTRIBUTE_DISABLED = 'aria-disabled';

function mutate_queue(queue, callback) {
  for (const element of queue) {
    callback(element);
  }

  return queue;
}

function disable_element(element) {
  element.setAttribute(ATTRIBUTE_DISABLED, 'true');

  return element;
}

function enable_implicitly(element) {
  element.removeAttribute(ATTRIBUTE_DISABLED);

  return element;
}

function enable_explicitly(element) {
  element.setAttribute(ATTRIBUTE_DISABLED, 'false');

  return element;
}

const is_implicitly_enabled = element =>
  !element
    .hasAttribute(ATTRIBUTE_DISABLED);

const is_explicitly_enabled = element =>
  element
    .getAttribute(ATTRIBUTE_DISABLED) === 'false';

function disable_subset(queue, filter) {
  const subset = queue.filter(filter);

  return mutate_queue(subset, disable_element);
}

function disable(context_node = document.body) {
  const queue = from(context_node.children);

  const to_subset = callback =>
    disable_subset(queue, callback);

  const [added, toggled] = [
    is_implicitly_enabled,
    is_explicitly_enabled,
  ].map(to_subset);

  return function reset_disabled() {
    mutate_queue(added, enable_implicitly);
    mutate_queue(toggled, enable_explicitly);
  };
}

//#endregion

//#region SVG

function set_missing_attribute(element, name, value) {
  if (!element.hasAttribute(name)) {
    element.setAttribute(name, value);
  }
}

function label_svg_with_description(root, title, description) {
  set_missing_attribute(description, 'id', unique());
  set_missing_attribute(root, 'aria-labelledby', [
    title.id,
    description.id,
  ].join(' '));
}

function annotate_svg_root(root, title) {
  const description = root.querySelector('desc');

  set_missing_attribute(title, 'id', unique());

  if (description) {
    label_svg_with_description(root, title, description);
  } else {
    set_missing_attribute(root, 'aria-labelledby', title.id);
  }
}

function svg_aria(svg_element) {
  const title = svg_element.querySelector('title');

  if (title) {
    set_missing_attribute(svg_element, 'role', 'img');
    annotate_svg_root(svg_element, title);
  } else {
    set_missing_attribute(svg_element, 'aria-hidden', 'true');
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
