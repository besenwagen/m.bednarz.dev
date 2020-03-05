export {
  stacktrace,
};

const NEWLINE_EXPRESSION = /\s*\n\s*/;
const OFFSET_SELF = 1;

const notEmpty = line =>
  line !== 'Error'
  && line !== '';

const format = stack =>
  stack
    .trim()
    .split(NEWLINE_EXPRESSION)
    .filter(notEmpty)
    .slice(OFFSET_SELF);

function stacktrace() {
  const { stack } = new Error();

  if (stack) {
    return format(stack);
  }

  return '';
}
