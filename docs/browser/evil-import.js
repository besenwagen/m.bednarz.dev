/**
 * Copyright 2020 Eric Bednarz <https://m.bednarz.dev>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
export {
  evil_import,
};

import { resolve_blob_url } from './url.js';

const type = 'application/javascript';

function evil_import(source_text) {
  const resolve = url => import(url);

  return resolve_blob_url(resolve, source_text, type);
}
