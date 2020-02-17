export {
  asArray,
  callOrNothingAtAll,
  unique,
};

/**
 * @param {*} condition
 * @param {Array} tuple
 * @returns {*}
 */
function callOrNothingAtAll(condition, [handler, argumentList]) {
  if (condition) {
    return handler(...argumentList);
  }
}

const { isArray } = Array;

function asArray(value) {
  if (isArray(value)) {
    return value;
  }

  return [value];
}

//#region unique

const { random, round } = Math;

const INITIAL_SUM = 0;
const FIRST_INDEX = 0;
const RANDOM_OFFSET = 2;
const ID_BASE = 36;
const DEFAULT_LENGTH = 9;

const toSubTotal = (total, value) => (total + value);

const add = (...operands) =>
  operands
    .reduce(toSubTotal, INITIAL_SUM);

const randomInteger = () =>
  Number(String(random()).slice(RANDOM_OFFSET));

const unique = (length = DEFAULT_LENGTH) => add(
  randomInteger(),
  Date.now(),
  round(performance.now()),
)
  .toString(ID_BASE)
  .substring(FIRST_INDEX, length);

//#endregion
