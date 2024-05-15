import { Currency } from '@ukef/dtfs2-common';

const GBP_TO_EUR = 1.1;
const EUR_TO_GBP = 1 / GBP_TO_EUR;

const GBP_TO_USD = 1.3;
const USD_TO_GBP = 1 / GBP_TO_USD;

const GBP_TO_JPY = 100.1;
const JPY_TO_GBP = 1 / GBP_TO_JPY;

const EUR_TO_USD = 1.05;
const USD_TO_EUR = 1 / EUR_TO_USD;

const EUR_TO_JPY = 90.9;
const JPY_TO_EUR = 1 / EUR_TO_JPY;

const USD_TO_JPY = 120;
const JPY_TO_USD = 1 / USD_TO_JPY;

const EXCHANGE_RATE_MAP: Record<Currency, Record<Currency, number>> = {
  GBP: {
    GBP: 1,
    EUR: GBP_TO_EUR,
    USD: GBP_TO_USD,
    JPY: GBP_TO_JPY,
  },
  EUR: {
    GBP: EUR_TO_GBP,
    EUR: 1,
    USD: EUR_TO_USD,
    JPY: EUR_TO_JPY,
  },
  USD: {
    GBP: USD_TO_GBP,
    EUR: USD_TO_EUR,
    USD: 1,
    JPY: USD_TO_JPY,
  },
  JPY: {
    GBP: JPY_TO_GBP,
    EUR: JPY_TO_EUR,
    USD: JPY_TO_USD,
    JPY: 1,
  },
} as const;

export const getExchangeRate = ({ from, to }: { from: Currency; to: Currency }): number => EXCHANGE_RATE_MAP[from][to];
