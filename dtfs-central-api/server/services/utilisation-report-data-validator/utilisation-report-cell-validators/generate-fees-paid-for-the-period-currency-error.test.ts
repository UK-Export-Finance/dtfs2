import { CURRENCY } from '@ukef/dtfs2-common';
import { generateFeesPaidForThePeriodCurrencyError } from './generate-fees-paid-for-the-period-currency-error';

describe('generateMonthlyFeesPaidCurrencyError', () => {
  const testExporterName = 'test-exporter';
  it('returns an error when the value is missing', () => {
    const nullMonthlyFeesPaidCurrency = {
      value: null,
      column: 'A',
      row: 1,
    };
    const expectedError = {
      errorMessage: 'Fees paid to UKEF currency must have an entry',
      column: 'A',
      row: 1,
      value: null,
      exporter: testExporterName,
    };

    const monthlyFeesPaidToUkefCurrencyError = generateFeesPaidForThePeriodCurrencyError(nullMonthlyFeesPaidCurrency, testExporterName);

    expect(monthlyFeesPaidToUkefCurrencyError).toEqual(expectedError);
  });

  it('should return an error when the value is not a currency code', () => {
    const invalidBaseCurrency = {
      value: 'INR',
      column: 'A',
      row: 1,
    };
    const expectedError = {
      errorMessage: 'The report can only include the following currencies: GBP, EUR, USD, JPY',
      column: 'A',
      row: 1,
      value: 'INR',
      exporter: testExporterName,
    };

    const monthlyFeesPaidToUkefCurrencyError = generateFeesPaidForThePeriodCurrencyError(invalidBaseCurrency, testExporterName);

    expect(monthlyFeesPaidToUkefCurrencyError).toEqual(expectedError);
  });

  it.each(Object.values(CURRENCY))('should return null if the value is "%s"', (currency) => {
    const validBaseCurrency = {
      value: currency,
      column: 'A',
      row: 1,
    };

    const baseCurrencyError = generateFeesPaidForThePeriodCurrencyError(validBaseCurrency, testExporterName);

    expect(baseCurrencyError).toBeNull();
  });
});
