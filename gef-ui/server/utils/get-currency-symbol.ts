import { CURRENCY, Currency } from '@ukef/dtfs2-common';

/**
 * Gets the currency symbol.
 * @param currency - the currency
 * @returns the currency symbol
 */
export const getCurrencySymbol = (currency: Currency) => {
  switch (currency) {
    case CURRENCY.USD:
      return '$';
    case CURRENCY.EUR:
      return '€';
    case CURRENCY.GBP:
      return '£';
    case CURRENCY.JPY:
      return '¥';
    default:
      return '';
  }
};
