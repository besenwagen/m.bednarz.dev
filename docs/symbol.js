export {
  symbolMap,
};

const { assign, create } = Object;

const toSymbolMap = (map, descriptor) =>
  assign(map, {
    [descriptor]: Symbol(descriptor),
  });

const symbolMap = descriptors =>
  descriptors
    .reduce(toSymbolMap, create(null));
