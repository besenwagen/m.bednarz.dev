/**
 * Copyright 2020 Eric Bednarz <https://m.bednarz.dev>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
export {
  component,
  conditional as _conditional,
};

/* global HTMLElement customElements document */

const {
  assign,
  create,
  keys,
  getOwnPropertyNames,
} = Object;
const empty = create(null);

function conditional(condition, ...rest) {
  if (typeof condition === 'function') {
    condition(...rest);
  } else if (condition) {
    const next = rest.shift();

    next(...rest);
  }
}

const has_method = (object, name) =>
  getOwnPropertyNames(object).includes(name);

function get_methods(element) {
  function to_methods(accumulator, name) {
    const property = element[name];

    if (typeof property === 'function') {
      accumulator[name] = property;
    }

    return accumulator;
  }

  return getOwnPropertyNames(element)
    .reduce(to_methods, create(null));
}

function create_instance_state(instance) {
  const { attributes, shadowRoot } = instance;

  return assign(new Map(), {
    root: shadowRoot,
    attributes(...names) {
      const to_attribute_value = name =>
        attributes[name].value;

      if (names.length === Number(true)) {
        return to_attribute_value(names);
      }

      return names.map(to_attribute_value);
    },
    methods() {
      return get_methods(instance);
    },
  });
}

function overload_template(template) {
  if (typeof template === 'string') {
    return document.querySelector(template);
  }

  console.info(template);

  return template;
}

function use_template(context, template) {
  const blueprint = overload_template(template);
  const node = blueprint.content.cloneNode(true);

  context.shadowRoot.appendChild(node);
}

function set_shadow_dom(context, template) {
  context.attachShadow({ mode: 'open' });
  conditional(template, use_template, context, template);
}

function add_listeners(context, events) {
  const { shadowRoot } = context;

  for (const type of keys(events)) {
    shadowRoot.addEventListener(type, context);
  }
}

function remove_listeners(context, events) {
  const { shadowRoot } = context;

  for (const type of keys(events)) {
    shadowRoot.removeEventListener(type, context);
  }
}

function component(component_name, {
  template,
  attributes = empty,
  events,
  initialize,
  connect,
  render,
  disconnect,
}) {
  const state = new WeakMap();

  customElements.define(component_name, class extends HTMLElement {
    static get observedAttributes() {
      return keys(attributes);
    }

    constructor() {
      super();
      set_shadow_dom(this, template);

      const instance_state = create_instance_state(this);

      state.set(this, instance_state);
      conditional(initialize, instance_state);
    }

    connectedCallback() {
      const instance_state = state.get(this);

      conditional(events, add_listeners, this, events);
      conditional(connect, instance_state);
      conditional(render, instance_state);
    }

    disconnectedCallback() {
      conditional(events, remove_listeners, this, events);
      conditional(disconnect, state.get(this));
    }

    attributeChangedCallback(attribute_name, old_value, new_value) {
      if (old_value) {
        const method = attributes[attribute_name];
        const current_state = state.get(this);

        method(current_state, new_value, old_value);
      }
    }

    handleEvent(event_object) {
      const { type } = event_object;

      if (has_method(events, type)) {
        events[type](event_object, state.get(this));
      }
    }
  });
}
