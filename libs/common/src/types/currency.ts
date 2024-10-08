import { ValuesOf } from './types-helper';
import { CURRENCY } from '../constants';

export type Currency = ValuesOf<typeof CURRENCY>;

export type CurrencyAndAmount = {
  currency: Currency;
  amount: number;
};

export type CurrencyAndAmountString = `${Currency} ${string}`;
