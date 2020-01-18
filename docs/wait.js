export {
  wait,
};

/**
 * @return {number}
 */
const timestamp = () => Number(new Date());

/**
 * Promise API for `setTimeout`.
 * @param {number} delay
 *   the planned waiting time
 * @return {Promise<number>}
 *   the actual elapsed time
 */
function wait(delay) {
  /**
   * The promise executor.
   * @param {function} resolve
   */
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
