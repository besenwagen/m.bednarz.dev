/**
 * Copyright 2020 Eric Bednarz <https://m.bednarz.dev>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
export {
  blob,
  json,
  text,
  api,
  request,
  settle_request,
};

/* global fetch */

const { assign, create } = Object;
const { createObjectURL } = URL;
const DEFAULT_METHOD = 'GET';

function on_response(response) {
  if (response.ok) {
    return response;
  }

  return Promise.reject(response);
}

const settle_request = (...argument_list) =>
  fetch(...argument_list)
    .then(on_response);

//#region concurrency guard

class ConcurrencyError extends Error {
  constructor(id) {
    super();
    this.message = `Concurrent unsettled request: ${id}`;
  }
}

const UNSETTLED_REQUESTS = new Set();

function with_concurrency_guard(request_identifier, request_arguments) {
  if (UNSETTLED_REQUESTS.has(request_identifier)) {
    return Promise
      .reject(new ConcurrencyError(request_identifier));
  }

  function on_request_settled(response_value) {
    UNSETTLED_REQUESTS.delete(request_identifier);

    return response_value;
  }

  UNSETTLED_REQUESTS.add(request_identifier);

  return settle_request(...request_arguments)
    .then(on_request_settled);
}

const get_request_method = ({
  method = DEFAULT_METHOD,
} = {}) => method;

function request(url, configuration) {
  const request_identifier = [
    get_request_method(configuration),
    url,
  ].join(' ');

  return with_concurrency_guard(
    request_identifier,
    [url, configuration]
  );
}

//#endregion

//#region public

const { stringify } = JSON;
const MIME_JSON = 'application/json';

const on_json_resolved = response => response.json();

const json = url =>
  request(url, {
    headers: {
      Accept: MIME_JSON,
    },
  })
    .then(on_json_resolved);

const on_text_resolved = response => response.text();

const text = url =>
  request(url)
    .then(on_text_resolved);

const on_blob_resolved = response =>
  createObjectURL(response.blob());

const blob = url =>
  request(url)
    .then(on_blob_resolved);

const api = assign(create(null), {
  delete(url) {
    return request(url, {
      method: 'DELETE',
    });
  },
  get(url) {
    return request(url, {
      method: DEFAULT_METHOD,
    });
  },
  patch(url, data) {
    return request(url, {
      body: stringify(data),
      method: 'PATCH',
    });
  },
  post(url, data) {
    return request(url, {
      body: stringify(data),
      method: 'POST',
    });
  },
  put(url, data) {
    return request(url, {
      body: stringify(data),
      method: 'PUT',
    });
  },
});

//#endregion
