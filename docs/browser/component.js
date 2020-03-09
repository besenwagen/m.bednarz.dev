/**
 * Copyright 2020 Eric Bednarz <https://m.bednarz.dev>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
export {
  component,
  conditional as _conditional,
};

/* global HTMLElement customElements document */

const { assign, create, keys, getOwnPropertyNames } = Object;
const empty = create(null);

function conditional(condition, ...rest) {
  if (typeof condition === 'function') {
    condition(...rest);
  } else if (condition) {
    const next = rest.shift();

    next(...rest);
  }
}

const hasMethod = (object, name) =>
  getOwnPropertyNames(object).includes(name);

function getMethods(element) {
  function toMethods(accumulator, name) {
    const property = element[name];

    if (typeof property === 'function') {
      accumulator[name] = property;
    }

    return accumulator;
  }

  return getOwnPropertyNames(element)
    .reduce(toMethods, create(null));
}

function createInstanceState(instance) {
  const { attributes, shadowRoot } = instance;

  return assign(new Map(), {
    root: shadowRoot,
    attributes(...names) {
      const toAttributeValue = name =>
        attributes[name].value;

      if (names.length === Number(true)) {
        return toAttributeValue(names);
      }

      return names.map(toAttributeValue);
    },
    methods() {
      return getMethods(instance);
    },
  });
}

function overloadTemplate(template) {
  if (typeof template === 'string') {
    return document.querySelector(template);
  }

  console.info(template);

  return template;
}

function useTemplate(context, template) {
  const blueprint = overloadTemplate(template);
  const node = blueprint.content.cloneNode(true);

  context.shadowRoot.appendChild(node);
}

function setShadowDom(context, template) {
  context.attachShadow({ mode: 'open' });
  conditional(template, useTemplate, context, template);
}

function addListeners(context, events) {
  const { shadowRoot } = context;

  for (const type of keys(events)) {
    shadowRoot.addEventListener(type, context);
  }
}

function removeListeners(context, events) {
  const { shadowRoot } = context;

  for (const type of keys(events)) {
    shadowRoot.removeEventListener(type, context);
  }
}

function component(componentName, {
  template,
  attributes = empty,
  events,
  initialize,
  connect,
  render,
  disconnect,
}) {
  const state = new WeakMap();

  customElements.define(componentName, class extends HTMLElement {
    static get observedAttributes() {
      return keys(attributes);
    }

    constructor() {
      super();
      setShadowDom(this, template);

      const instanceState = createInstanceState(this);

      state.set(this, instanceState);
      conditional(initialize, instanceState);
    }

    connectedCallback() {
      const instanceState = state.get(this);

      conditional(events, addListeners, this, events);
      conditional(connect, instanceState);
      conditional(render, instanceState);
    }

    disconnectedCallback() {
      conditional(events, removeListeners, this, events);
      conditional(disconnect, state.get(this));
    }

    attributeChangedCallback(attributeName, oldValue, newValue) {
      if (oldValue) {
        attributes[attributeName](state.get(this), newValue, oldValue);
      }
    }

    handleEvent(eventObject) {
      const { type } = eventObject;

      if (hasMethod(events, type)) {
        events[type](eventObject, state.get(this));
      }
    }
  });
}
