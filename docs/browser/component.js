export {
  BaseComponent,
  defineComponents,
  withAttributes,
  getAttributeObserverName,
  getComponentName,
};

import { createStore } from '../store.js';

/* eslint max-classes-per-file: [error, 2] */
/* global customElements HTMLElement */

const { assign, getOwnPropertyNames } = Object;

//#region name

const TOKEN_THRESHOLD = 2;
const HUMP_EXPRESSION = /(?=[A-Z])/;

function getComponentName({ name }) {
  const match = name.split(HUMP_EXPRESSION);

  if (match.length < TOKEN_THRESHOLD) {
    throw new Error(`${name} is not a valid identifier`);
  }

  return match
    .join('-')
    .toLowerCase();
}

function capitalize(word) {
  const [firstLetter] = word;
  const { length } = firstLetter;

  return [
    firstLetter.toUpperCase(),
    word.substring(length),
  ].join('');
}

const toUpperCamelCase = dashed =>
  dashed
    .split('-')
    .map(capitalize)
    .join('');

const getAttributeObserverName = attribute =>
  `on${toUpperCamelCase(attribute)}Change`;

//#endregion

class BaseComponent extends HTMLElement {
  static toEventType(accumulator, name) {
    const match = /^on([A-Z][a-z]+)Event$/.exec(name);

    if (match) {
      const [, type] = match;

      accumulator.push(type.toLowerCase());
    }

    return accumulator;
  }

  constructor() {
    super();
    assign(this, createStore());
    this.addListeners();
    this.initialize();
  }

  getEvents() {
    const {
      toEventType,
      prototype,
    } = this.constructor;

    return getOwnPropertyNames(prototype)
      .reduce(toEventType, []);
  }

  addListeners() {
    for (const type of this.getEvents()) {
      this.addEventListener(type, this);
    }
  }

  handleEvent(eventObject) {
    const { type } = eventObject;
    const method = `on${capitalize(type)}Event`;

    if (typeof this[method] === 'function') {
      this[method](eventObject);
    }
  }

  initialize() {
    console.info('initialized');
  }

  connected() {
    console.info('connected');
  }

  disconnected() {
    console.info('disconnected');
  }

  connectedCallback() {
    this.render();
    this.connected();
  }

  disconnectedCallback() {
    this.disconnected();
  }

  update(name, oldValue, newValue) {
    const handler = getAttributeObserverName(name);

    if (typeof this[handler] === 'function') {
      this[handler](newValue, oldValue);
    } else {
      this.render();
    }
  }

  isAttributeUpdate(oldValue, newValue) {
    return (
      (oldValue !== null)
      && (oldValue !== newValue)
    );
  }

  attributeChangedCallback(name, ...rest) {
    if (this.isAttributeUpdate(...rest)) {
      this.update(name, ...rest);
    }
  }
}

const withAttributes = attributes =>
  class extends BaseComponent {
    static get observedAttributes() {
      return attributes;
    }
  };

function defineComponents(...components) {
  for (const constructor of components) {
    const name = getComponentName(constructor);

    customElements.define(name, constructor);
  }
}
