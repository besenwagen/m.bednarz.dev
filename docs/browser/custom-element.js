/**
 * Copyright 2021 Eric Bednarz <https://m.bednarz.dev>
 * SPDX-License-Identifier: EUPL-1.2
 */

/* eslint-env browser */
/* eslint complexity: [error, 4], max-depth: [error, 2] */

const { assign, create, entries } = Object;

const element_map = assign(create(null), {
  a: HTMLAnchorElement,
  audio: HTMLAudioElement,
  blockquote: HTMLQuoteElement,
  button: HTMLButtonElement,
  canvas: HTMLCanvasElement,
  div: HTMLDivElement,
  dl: HTMLDListElement,
  fieldset: HTMLFieldSetElement,
  form: HTMLFormElement,
  h1: HTMLHeadingElement,
  h2: HTMLHeadingElement,
  h3: HTMLHeadingElement,
  h4: HTMLHeadingElement,
  h5: HTMLHeadingElement,
  h6: HTMLHeadingElement,
  img: HTMLImageElement,
  ol: HTMLOListElement,
  input: HTMLInputElement,
  p: HTMLParagraphElement,
  pre: HTMLPreElement,
  select: HTMLSelectElement,
  span: HTMLSpanElement,
  table: HTMLTableElement,
  textarea: HTMLTextAreaElement,
  ul: HTMLUListElement,
  video: HTMLVideoElement,
});

const generic = new Set([
  'article',
  'aside',
  'figure',
  'footer',
  'header',
  'main',
  'nav',
  'section',
]);

const shadow = new Set([
  ...generic,
  'blockquote',
  'div',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'p',
  'span',
]);

const registry = new WeakMap();
const shared_stash = new Map();
const subscriptions = new WeakMap();

function get_stash(key) {
  if (key) {
    const data = shared_stash.get(key);

    shared_stash.delete(key);

    return data;
  }

  return null;
}

function stash(value) {
  const key = String(shared_stash.size + 1);

  shared_stash.set(key, value);

  return key;
}

function initialize(instance) {
  const { nodeName } = instance;
  const root = (nodeName.includes('-') || shadow.has(nodeName.toLowerCase())) ?
    instance.attachShadow({
      mode: 'closed',
    }) :
    instance;
  const data = { ...instance.dataset };

  return [root, data];
}

const with_dependencies = ({
  html,
  render,
  store,
  actions,
}) =>
  function custom_element_factory(base_class, {
    template,
    update,
    select,
    map,
    events,
    connect,
    disconnect,
  }) {
    if (select) {
      const {
        dispatch,
        getState,
        subscribe,
      } = store;

      const listeners = events ? events(dispatch, actions) : null;

      function connect_to_store(onchange) {
        let current_state;

        function handle_change() {
          const next_state = select(getState());

          if (next_state !== current_state) {
            current_state = next_state;
            onchange(current_state);
          }
        }

        handle_change();

        return subscribe(handle_change);
      }

      const with_store = instance =>
        function mutate(state) {
          const [root, data] = registry.get(instance);
          const properties = (typeof map === 'function')
            ? map(dispatch, state, data)
            : state;

          if (update) {
            update(instance, properties, root);
          }

          if (template) {
            render(root, template(html, properties));
          }
        };

      return class extends base_class {
        constructor() {
          super();
          registry.set(this, new Set(initialize(this)));
        }

        connectedCallback() {
          subscriptions.set(this, connect_to_store(with_store(this)));

          if (listeners) {
            for (const [type, handler] of entries(listeners)) {
              this.addEventListener(type, handler);
            }
          }

          if (connect) {
            connect(this);
          }
        }

        disconnectedCallback() {
          const unsubscribe = subscriptions.get(this);

          unsubscribe();

          if (listeners) {
            for (const [type, handler] of entries(listeners)) {
              this.removeEventListener(type, handler);
            }
          }

          if (disconnect) {
            disconnect(this);
          }
        }
      };
    }

    return class extends base_class {
      static observedAttributes = ['data-stash'];

      constructor() {
        super();

        const [root, dataset] = initialize(this);

        function mutate(instance) {
          const { stash: key } = instance.dataset;
          const data = {
            ...dataset,
            ...get_stash(key),
          };

          if (update) {
            update(instance, data, root);
          }

          if (template) {
            render(root, template(html, data, stash));
          }
        }

        registry.set(this, mutate);
      }

      connectedCallback() {
        const mutate = registry.get(this);

        mutate(this);

        if (connect) {
          connect(this);
        }
      }

      disconnectedCallback() {
        if (disconnect) {
          disconnect(this);
        }
      }

      attributeChangedCallback(name, oldValue) {
        if (oldValue) {
          const mutate = registry.get(this);

          mutate(this);
        }
      }
    };
  };

function base(element) {
  if (element_map[element]) {
    return element_map[element];
  }

  if (shadow.has(element)) {
    return HTMLElement;
  }
}

export function define(components, dependencies) {
  const custom_element = with_dependencies(dependencies);

  for (const [key, value] of entries(components)) {
    const name = key.replace(/_/g, '-');
    const { element, ...options } = value;

    const argumentList = element ? [
      name,
      custom_element(base(element), options),
      { extends: element },
    ] : [
      name,
      custom_element(HTMLElement, options),
    ];

    customElements.define(...argumentList);
  }
}
