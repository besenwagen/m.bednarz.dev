export {
  hook,
  useState,
};

const store = new WeakMap();
const callStack = [];
const ARRAY_EMPTY = 0;

function createState(context) {
  const state = [];

  store.set(context, state);

  return state;
}

function getState() {
  const [context] = callStack;

  if (store.has(context)) {
    return store.get(context);
  }

  return createState(context);
}

const isStateHook = call =>
  call === useState;

const getCurrentStateIndex = () =>
  callStack
    .filter(isStateHook)
    .length;

function initialize(initialState) {
  const state = getState();
  const currentIndex = getCurrentStateIndex();

  if (state.length === currentIndex) {
    state.push(initialState);
  }

  return {
    get() {
      return state[currentIndex];
    },
    set(nextState) {
      state[currentIndex] = nextState;

      return nextState;
    },
  };
}

function useState(initialState) {
  const { get, set } = initialize(initialState);

  const setState = nextState => [
    get(),
    set(nextState),
  ].reverse();

  callStack.push(useState);

  return [get(), setState];
}

const hook = callable =>
  function withStateHook(...argumentList) {
    callStack.push(callable);

    const returnValue = callable(...argumentList);

    callStack.length = ARRAY_EMPTY;

    return returnValue;
  };
