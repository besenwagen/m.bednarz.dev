/**
 * Copyright 2020 Eric Bednarz <https://m.bednarz.dev>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
export {
  evilImport,
};

/* global Blob */

const type = 'application/javascript';
const { createObjectURL, revokeObjectURL } = URL;

const toBlob = string =>
  new Blob([string], { type });

const toObjectUrl = string =>
  createObjectURL(toBlob(string));

function evilImport(sourceText) {
  const objectUrl = toObjectUrl(sourceText);

  function onResolved(resolvedModule) {
    revokeObjectURL(objectUrl);

    return resolvedModule;
  }

  return import(objectUrl)
    .then(onResolved);
}
