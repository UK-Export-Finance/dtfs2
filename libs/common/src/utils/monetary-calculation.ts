import { Big } from 'big.js';

/**
 * Applies an exchange rate to a monetary amount using the big.js library
 * @param amount - The monetary amount to apply the exchange rate to
 * @param exchangeRate - The exchange rate to apply to `amount`
 * @param operation - Whether to multiply or divide the `amount` by the `exchangeRate`
 * @param [precision=2] - The number of decimal places of precision to use when applying the exchange rate
 * @returns The amount after the exchange rate has been applied
 */
export const applyExchangeRateToAmount = (amount: number, exchangeRate: number, operation: 'multiply' | 'divide', precision = 2): number => {
  const amountAsBig = new Big(amount);
  const exchangeRateAsBig = new Big(exchangeRate);

  switch (operation) {
    case 'multiply':
      return amountAsBig.times(exchangeRateAsBig).round(precision).toNumber();
    case 'divide':
      return amountAsBig.div(exchangeRateAsBig).round(precision).toNumber();
    default:
      throw new Error(`Operation '${operation}' not recognised (expected 'multiply' or 'divide')`);
  }
};
