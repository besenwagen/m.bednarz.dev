/**
 * Copyright 2019, 2020 Eric Bednarz <https://m.bednarz.dev>
 * SPDX-License-Identifier: AGPL-3.0-or-later
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
