export {
  data,
  json,
};

/* global fetch */

const STATUS_OK = 200;

const request = (type, url, options) =>
  fetch(url, options)
    .then(function onResponse(response) {
      if (response.status === STATUS_OK) {
        return response[type]();
      }

      return Promise.reject(response);
    });

const json = (...args) =>
  request('json', ...args);

const data = (...args) =>
  request('text', ...args);
