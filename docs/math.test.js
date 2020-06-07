import { result, suite } from './test.js'
import {
  centi,
  deca,
  deci,
  double,
  half,
  hecto,
  kilo,
  milli,
  quarter,
} from './math.js'

const test = suite(import.meta)

export default result(test)

test(quarter)
  ('a quarter of the value', [
    quarter(28),
    7,
  ])

test(half)
  ('half the value', [
    half(14),
    7,
  ])

test(double)
  ('twice the value', [
    double(7),
    14,
  ])

test(deci)
  ('a tenth of the vale', [
    deci(70),
    7,
  ])

test(deca)
  ('ten times the value', [
    deca(7),
    70,
  ])

test(centi)
  ('a hundredth of the value', [
    centi(700),
    7,
  ])

test(hecto)
  ('hundred times the value', [
    hecto(7),
    700,
  ])

test(milli)
  ('a thousandth of the value', [
    milli(7000),
    7,
  ])

test(kilo)
  ('a thousand times the value', [
    kilo(7),
    7000,
  ])
