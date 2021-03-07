export { factory };

/* global HTMLElement, customElements */

const { from } = Array;
const { assign, create, entries } = Object;

const mode = 'closed';
const rendered_with_properties = Symbol('Rendered with properties');
const instances = new WeakMap();

const to_property = (accumulator, {
  name,
  value,
}) => assign(accumulator, {
  [name]: value,
});

const attributes_to_object = named_node_map =>
  from(named_node_map)
    .reduce(to_property, create(null));

const component_factory = ({
  html,
  render,
  shadow,
  template,
}) =>
  class extends HTMLElement {
    set properties(object) {
      const set = instances.get(this);
      const [root, attributes] = set;

      render(root, template(html, {
        ...attributes,
        ...object,
      }));

      if (!set.has(rendered_with_properties)) {
        set.add(rendered_with_properties);
      }
    }

    constructor() {
      super();
      const root = shadow ?
        this.attachShadow({ mode }) :
        this;
      const attributes = attributes_to_object(this.attributes);

      instances.set(this, new Set([root, attributes]));
    }

    connectedCallback() {
      const [root, attributes, state] = instances.get(this);

      if (state !== rendered_with_properties) {
        render(root, template(html, attributes));
      }
    }
  };

const get_element_name = (...argument_list) =>
  argument_list
    .filter(value => value)
    .join('-')
    .replace(/_/g, '-')
    .replace(/([^A-Z])([A-Z])/g, '$1-$2')
    .toLowerCase();

function define({
  components,
  namespace,
  ...rest
}) {
  for (const [identifier, template] of entries(components)) {
    const name = get_element_name(namespace, identifier);
    const component = component_factory({
      template,
      ...rest,
    });

    customElements.define(name, component);
  }
}

const factory = config => assign(create(null), {
  shadow(components) {
    define({
      components,
      shadow: true,
      ...config,
    });

    return this;
  },
  light(components) {
    define({
      components,
      shadow: false,
      ...config,
    });

    return this;
  },
});
