export {
  compose,
  pipe,
  stage,
};

const passValueTo = (currentValue, transform) =>
  transform(currentValue);

const compose = (...transformers) =>
  initialValue =>
    transformers
      .reduceRight(passValueTo, initialValue);

const pipe = (...transformers) =>
  initialValue =>
    transformers
      .reduce(passValueTo, initialValue);

const stage = callback =>
  boundArgument =>
    callback.bind(null, boundArgument);
