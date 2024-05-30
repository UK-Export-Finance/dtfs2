import { CurrencyAndAmount, CurrencyAndAmountString } from '../types';

/**
 * Gets the formatted currency and amount using the 'en-GB' number formatting
 * for the amount
 * @param currencyAndAmount - The currency and amount object
 * @returns The formatted currency and amount
 * @example
 * const amount = getFormattedCurrencyAndAmount({ currency: 'GBP', amount: 3.14159 }); // 'GBP 3.14'
 */
export const getFormattedCurrencyAndAmount = (currencyAndAmount: CurrencyAndAmount): CurrencyAndAmountString => {
  const formatter = new Intl.NumberFormat('en-GB', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const formattedAmount = formatter.format(currencyAndAmount.amount);
  return `${currencyAndAmount.currency} ${formattedAmount}`;
};
