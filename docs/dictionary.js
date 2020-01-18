const {
  assign,
  create,
  defineProperty,
  defineProperties,
  entries,
} = Object;

const stringTagDescriptor = {
  value: 'Dictionary',
};

const blueprint = () =>
  defineProperty(
    create(null),
    Symbol.toStringTag,
    stringTagDescriptor
  );

/**
 * @param {object} accumulator
 * @param {array} tuple key/value
 */
const toDescriptor = (accumulator, [key, value]) =>
  assign(accumulator, {
    [key]: {
      enumerable: true,
      value,
    },
  });

/**
 * @param {object} descriptor
 */
export const dictionary = descriptor =>
  defineProperties(
    blueprint(),
    entries(descriptor)
      .reduce(toDescriptor, {})
  );
