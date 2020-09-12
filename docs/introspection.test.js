import { result, suite } from './test.js'
import {
  get_constructor_name, get_function_name,
  get_string_tag, is_array,
  is_boolean, is_complex, is_date,
  is_data_primitive, is_defined, is_error,
  is_false, is_finite, is_function,
  is_instance_of, is_integer, is_json_primitive,
  is_nan, is_null, is_number, is_object,
  is_primitive, is_promise, is_regexp,
  is_symbol, is_thenable, is_true, is_undefined,
} from './introspection.js'

const test = suite(import.meta)

export default result(test)

test(get_constructor_name)
  ('promise instance', [
    get_constructor_name(new Promise(() => null)),
    'Promise',
  ])

test(get_function_name)
  ('declaration', [
    get_function_name(function foo() { }),
    'foo',
  ])

test(get_string_tag)
  ('object', [get_string_tag({}), 'Object'])
  ('object without prototype', [
    get_string_tag(Object.create(null)),
    'Object',
  ])
  ('array', [get_string_tag([]), 'Array'])
  ('function', [get_string_tag(() => null), 'Function'])
  ('regexp', [get_string_tag(Promise.resolve()), 'Promise'])
  ('regexp', [get_string_tag(/regexp/), 'RegExp'])
  ('symbol', [get_string_tag(Symbol('symbol')), 'Symbol'])
  ('string', [get_string_tag('string'), 'String'])
  ('number', [get_string_tag(42), 'Number'])
  ('boolean true', [get_string_tag(true), 'Boolean'])
  ('boolean false', [get_string_tag(false), 'Boolean'])
  ('null', [get_string_tag(null), 'Null'])
  ('undefined', [get_string_tag(undefined), 'Undefined'])

test(is_array)
  ('array literal', is_array([]))
  ('Array instance', is_array(new Array()))

test(is_boolean)
  ('true', is_boolean(true))
  ('false', is_boolean(false))

test(is_complex)
  ('function', is_complex(() => null))
  ('object', is_complex({}))
  ('array', is_complex([]))
  ('date', is_complex(new Date()))
  ('not null', [is_complex(null), false])

test(is_data_primitive)
  ('string', is_data_primitive(''))
  ('number', is_data_primitive(0))
  ('not null', [is_data_primitive(null), false])
  ('not undefined', [is_data_primitive(undefined), false])
  ('not true', [is_data_primitive(true), false])
  ('not false', [is_data_primitive(false), false])

test(is_date)
  ('date instance', is_date(new Date()))

test(is_defined)
  ('empty string', is_defined(''))
  ('0', is_defined(0))
  ('null', is_defined(null))
  ('not undefined', [is_defined(undefined), false])

test(is_error)
  ('Error instance', is_error(new Error()))
  ('TypeError instance', is_error(new TypeError()))

test(is_false)
  ('false', is_false(false))
  ('not true', [is_false(true), false])

test(is_finite)
  ('number input', is_finite(42))
  ('does not coerce', [is_finite('42'), false])

test(is_function)
  ('arrow function', is_function(() => null))

test(is_instance_of)
  ('error instance', is_instance_of(new TypeError(), Error))

test(is_integer)
  ('integer', is_integer(42))
  ('not float', [is_integer(42.1), false])
  ('not numeric string', [is_integer('42'), false])

test(is_json_primitive)
  ('string', is_json_primitive('Hello, world!'))
  ('number', is_json_primitive(42))
  ('true', is_json_primitive(true))
  ('false', is_json_primitive(false))
  ('null', is_json_primitive(null))

test(is_nan)
  ('input', is_nan(NaN))
  ('does not coerce', [is_nan('42'), false])

test(is_null)
  ('null', is_null(null))
  ('not string', [is_null('null'), false])
  ('not undefined', [is_null(undefined), false])

test(is_number)
  ('number', is_number(42))
  ('not NaN', [is_number(NaN), false])
  ('not inifinity', [is_number(Infinity), false])

test(is_object)
  ('not null', [is_object(null), false])
  ('not array', [is_object([]), false])
  ('not function', [is_object(() => null), false])
  ('object without prototype', is_object(Object.create(null)))

test(is_primitive)
  ('string', is_primitive(''))
  ('number', is_primitive(0))
  ('true', is_primitive(true))
  ('false', is_primitive(false))
  ('undefined', is_primitive(undefined))
  ('null', is_primitive(null))
  ('symbol', is_primitive(Symbol('foobar')))

test(is_promise)
  ('Promise instance', is_promise(new Promise(() => null)))

test(is_regexp)
  ('regexp literal', is_regexp(/^fubar/))
  ('RegExp instance', is_regexp(new RegExp('^fubar')))

test(is_symbol)
  ('Symbol call', is_symbol(Symbol('foobar')))

test(is_thenable)
  ('must be a method', is_thenable({ then() { } }))
  ('can not be a property', [is_thenable({ then: '' }), false])

test(is_true)
  ('true', is_true(true))
  ('not false', [is_true(false), false])
  ('not string true', [is_true('true'), false])

test(is_undefined)
  ('undefined', is_undefined(undefined))
  ('not string', [is_undefined('undefined'), false])
  ('not null', [is_undefined(null), false])
