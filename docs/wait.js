/**
 * Copyright 2019, 2020 Eric Bednarz <https://m.bednarz.dev>
 * SPDX-License-Identifier: EUPL-1.2
 */
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
