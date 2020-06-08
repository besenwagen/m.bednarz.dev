/**
 * Copyright 2020 Eric Bednarz <https://m.bednarz.dev>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
export {
  evilImport,
};

import { resolveBlobUrl } from './url.js';

const type = 'application/javascript';

function evilImport(sourceText) {
  const resolve = url => import(url);

  return resolveBlobUrl(resolve, sourceText, type);
}
