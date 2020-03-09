/**
 * Copyright 2020 Eric Bednarz <https://m.bednarz.dev>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
export {
  centi,
  deca,
  deci,
  double,
  half,
  hecto,
  kilo,
  milli,
  quarter,
  ZERO,
  ONE,
  TWO,
  HUNDRED,
  THOUSAND,
  MINUTE,
  HOUR,
  DAY,
  WEEK,
  BINARY_BASE,
  DECIMAL_BASE,
  DUODECIMAL_BASE,
  OCTAL_BASE,
  SEXAGESIMAL_BASE,
  TETRAVIGESIMAL_BASE,
  TRECENTOSEXAGESIMAL_BASE,
};

const BINARY_BASE = 2;
const DECIMAL_BASE = 10;
const DUODECIMAL_BASE = 12;
const SEPTENARY_BASE = 7;
const OCTAL_BASE = 8;
const SEXAGESIMAL_BASE = 60;
const TETRAVIGESIMAL_BASE = 24;
const TRECENTOSEXAGESIMAL_BASE = 360;

const ZERO = DECIMAL_BASE - DECIMAL_BASE;
const ONE = (DECIMAL_BASE / DECIMAL_BASE);
const TWO = (ONE + ONE);
const HUNDRED = (DECIMAL_BASE * DECIMAL_BASE);
const THOUSAND = (HUNDRED * DECIMAL_BASE);

const MINUTE = SEXAGESIMAL_BASE;
const HOUR = (MINUTE * SEXAGESIMAL_BASE);
const DAY = (TETRAVIGESIMAL_BASE * HOUR);
const WEEK = (SEPTENARY_BASE * DAY);

const kilo = value => (value * THOUSAND);

const milli = value => (value / THOUSAND);

const hecto = value => (value * HUNDRED);

const centi = value => (value / HUNDRED);

const deca = value => (value * DECIMAL_BASE);

const deci = value => (value / DECIMAL_BASE);

const double = value => (value * TWO);

const half = value => (value / TWO);

const quarter = value => half(half(value));
