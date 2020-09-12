export {
  to_blob_url,
  resolve_blob_url,
};

/* global Blob */

const {
  createObjectURL: create_object_url,
  revokeObjectURL: revoke_object_url,
} = URL;

const to_blob_url = (data, type) =>
  create_object_url(new Blob([data], {
    type,
  }));

function resolve_blob_url(resolve, data, type) {
  const blob_url = to_blob_url(data, type);

  function on_resolved(resolved_module) {
    revoke_object_url(blob_url);

    return resolved_module;
  }

  return resolve(blob_url)
    .then(on_resolved);
}
