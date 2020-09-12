/**
 * Copyright 2019, 2020 Eric Bednarz <https://m.bednarz.dev>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
export {
  get_constructor_name,
  get_function_name,
  get_string_tag,
  is_array,
  is_boolean,
  is_complex,
  is_date,
  is_defined,
  is_error,
  is_false,
  is_finite,
  is_function,
  is_instance_of,
  is_integer,
  is_data_primitive,
  is_json_primitive,
  is_nan,
  is_not_null,
  is_null,
  is_number,
  is_object,
  is_primitive,
  is_promise,
  is_regexp,
  is_symbol,
  is_thenable,
  is_true,
  is_undefined,
};

const { isArray: is_array } = Array;
const {
  isFinite: is_finite,
  isSafeInteger: is_safe_integer,
  isNaN: is_nan,
} = Number;

const string_tag_expression = /^\[object ([^\]]+)\]$/;

const to_object_string = value =>
  Object.prototype.toString.call(value);

function get_string_tag(value) {
  const object_string = to_object_string(value);
  const [, string_tag] = string_tag_expression.exec(object_string);

  return string_tag;
}

const get_function_name = ({ name }) =>
  name;

const get_constructor_name = ({ constructor }) =>
  get_function_name(constructor);

//#region is_primitive

const is_undefined = value =>
  (value === undefined);

const is_null = value =>
  (value === null);

const is_boolean = value =>
  (typeof value === 'boolean');

const is_true = value =>
  (value === true);

const is_false = value =>
  (value === false);

const is_string = value =>
  (typeof value === 'string');

const is_number = value => (
  (typeof value === 'number')
  && is_finite(value)
  && !is_nan(value)
);

const is_integer = value =>
  is_safe_integer(value);

const is_symbol = value =>
  (typeof value === 'symbol');

const is_data_primitive = value => (
  is_string(value)
  || is_number(value)
);

const is_fixed_primitive = value => (
  is_boolean(value)
  || is_null(value)
  || is_undefined(value)
);

const is_json_primitive = value => (
  is_data_primitive(value)
  || is_boolean(value)
  || is_null(value)
);

const is_primitive = value => (
  is_data_primitive(value)
  || is_fixed_primitive(value)
  || is_symbol(value)
);

//#endregion

const is_defined = value =>
  !is_undefined(value);

const is_not_null = value =>
  !is_null(value);

const is_complex = value =>
  !is_primitive(value);

const is_date = value =>
  is_instance_of(value, Date);

const is_error = value =>
  is_instance_of(value, Error);

const is_function = value =>
  (typeof value === 'function');

const is_instance_of = (value, constructor) =>
  (value instanceof constructor);

const is_object = value => (
  !is_null(value)
  && (get_string_tag(value) === 'Object')
);

const is_regexp = value =>
  is_instance_of(value, RegExp);

const is_promise = value =>
  is_instance_of(value, Promise);

const is_thenable = value => (
  is_object(value)
  && is_function(value.then)
);
