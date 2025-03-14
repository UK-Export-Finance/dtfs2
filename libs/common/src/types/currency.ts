import { CURRENCY } from '../constants';

export type Currency = keyof typeof CURRENCY;

export type CurrencyAndAmount = {
  currency: Currency;
  amount: number;
};

export type CurrencyAndAmountString = `${Currency} ${string}`;
