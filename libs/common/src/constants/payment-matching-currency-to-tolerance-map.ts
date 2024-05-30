import { Currency } from '../types';

export const PAYMENT_MATCHING_CURRENCY_TO_TOLERANCE_MAP: Readonly<Record<Currency, number>> = {
  GBP: 0,
  EUR: 0,
  USD: 0,
  JPY: 0,
};
