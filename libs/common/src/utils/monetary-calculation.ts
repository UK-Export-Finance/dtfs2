import { Big } from 'big.js';

/**
 * Divides an amount by an exchange rate using the `big.js` package
 * @param amount - The monetary amount to apply the exchange rate to
 * @param exchangeRate - The exchange rate to divide `amount` by
 * @param [precision=2] - The number of decimal places of precision to use when applying the exchange rate
 * @returns The amount after the exchange rate has been applied
 */
export const divideAmountByExchangeRate = (amount: number, exchangeRate: number, precision = 2): number => {
  const amountAsBig = new Big(amount);
  const exchangeRateAsBig = new Big(exchangeRate);

  return amountAsBig.div(exchangeRateAsBig).round(precision).toNumber();
};
