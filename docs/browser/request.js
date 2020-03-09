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
  settleRequest,
};

/* global fetch */

const { assign, create } = Object;
const { createObjectURL } = URL;
const DEFAULT_METHOD = 'GET';

function onResponse(response) {
  if (response.ok) {
    return response;
  }

  return Promise.reject(response);
}

const settleRequest = (...argumentList) =>
  fetch(...argumentList)
    .then(onResponse);

//#region concurrency guard

class ConcurrencyError extends Error {
  constructor(id) {
    super();
    this.message = `Concurrent unsettled request: ${id}`;
  }
}

const UNSETTLED_REQUESTS = new Set();

function withConcurrencyGuard(requestIdentifier, requestArguments) {
  if (UNSETTLED_REQUESTS.has(requestIdentifier)) {
    return Promise
      .reject(new ConcurrencyError(requestIdentifier));
  }

  function onRequestSettled(responseValue) {
    UNSETTLED_REQUESTS.delete(requestIdentifier);

    return responseValue;
  }

  UNSETTLED_REQUESTS.add(requestIdentifier);

  return settleRequest(...requestArguments)
    .then(onRequestSettled);
}

const getRequestMethod = ({
  method = DEFAULT_METHOD,
} = {}) => method;

function request(url, configuration) {
  const requestIdentifier = [
    getRequestMethod(configuration),
    url,
  ].join(' ');

  return withConcurrencyGuard(requestIdentifier, [url, configuration]);
}

//#endregion

//#region public

const { stringify } = JSON;
const MIME_JSON = 'application/json';

const onJsonResolved = response => response.json();

const json = url =>
  request(url, {
    headers: {
      Accept: MIME_JSON,
    },
  })
    .then(onJsonResolved);

const onTextResolved = response => response.text();

const text = url =>
  request(url)
    .then(onTextResolved);

const onBlobResolved = response =>
  createObjectURL(response.blob());

const blob = url =>
  request(url)
    .then(onBlobResolved);

const api = assign(create(null), {
  delete(url) {
    return request(url, {
      method: 'DELETE',
    });
  },
  get(url) {
    return request(url, {
      method: 'GET',
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
