export {
  toBlobUrl,
  resolveBlobUrl,
};

/* global Blob */

const {
  createObjectURL,
  revokeObjectURL,
} = URL;

const toBlobUrl = (data, type) =>
  createObjectURL(new Blob([data], {
    type,
  }));

function resolveBlobUrl(resolve, data, type) {
  const blobUrl = toBlobUrl(data, type);

  function onResolved(resolvedModule) {
    revokeObjectURL(blobUrl);

    return resolvedModule;
  }

  return resolve(blobUrl)
    .then(onResolved);
}
