/**
 * Copyright 2019, 2020 Eric Bednarz <https://m.bednarz.dev>
 * SPDX-License-Identifier: EUPL-1.2
 */
export {
  insist,
};

/* global window */

function insist(message) {
  function executor(resolve) {
    const result = window.confirm(message);

    resolve(result);
  }

  return new Promise(executor);
}
