export {
  wait,
};

const timestamp = () => Number(new Date());

function wait(delay) {
  function executor(resolve) {
    const start = timestamp();

    function done() {
      const end = (timestamp() - start);

      resolve(end);
    }

    setTimeout(done, delay);
  }

  return new Promise(executor);
}
