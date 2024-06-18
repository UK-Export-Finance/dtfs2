import { CurrencyAndAmount } from '@ukef/dtfs2-common';
import Big from 'big.js';

/**
 * Sums the amounts in a list of currency and amount objects and
 * returns an object containing the sum and the matching currency.
 * The supplied currency and amount objects are expected to have
 * the same currency
 * @param currencyAndAmountList - The list of currency and amount objects
 * @returns An object containing the total amount and the currency
 * @throws {Error} If the supplied list is empty
 * @throws {Error} If the supplied list does not have a consistent currency
 */
export const calculateTotalCurrencyAndAmount = (currencyAndAmountList: CurrencyAndAmount[]): CurrencyAndAmount => {
  if (currencyAndAmountList.length === 0) {
    throw new Error('Supplied currency and amount list is empty');
  }

  const { currency: currencyOfTotal } = currencyAndAmountList[0];

  const totalAmount = currencyAndAmountList
    .reduce((total, { currency, amount }) => {
      if (currency !== currencyOfTotal) {
        throw new Error('Supplied currency and amount list does not have a consistent currency');
      }
      return total.add(amount);
    }, new Big(0))
    .toNumber();

  return {
    currency: currencyOfTotal,
    amount: totalAmount,
  };
};
