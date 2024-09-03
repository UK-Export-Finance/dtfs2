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

  it('returns an error when the value is not a valid ISO 4217 currency code', () => {
    const invalidBaseCurrency = {
      value: 'GBPA',
      column: 'A',
      row: 1,
    };
    const expectedError = {
      errorMessage: 'Fees paid to UKEF currency must be in the ISO 4217 currency code format',
      column: 'A',
      row: 1,
      value: 'GBPA',
      exporter: testExporterName,
    };

    const monthlyFeesPaidToUkefCurrencyError = generateFeesPaidForThePeriodCurrencyError(invalidBaseCurrency, testExporterName);

    expect(monthlyFeesPaidToUkefCurrencyError).toEqual(expectedError);
  });

  it('returns null if the value is a valid currency', () => {
    const validBaseCurrency = {
      value: 'GBP',
      column: 'A',
      row: 1,
    };

    const monthlyFeesPaidToUkefCurrencyError = generateFeesPaidForThePeriodCurrencyError(validBaseCurrency, testExporterName);

    expect(monthlyFeesPaidToUkefCurrencyError).toBeNull();
  });
});
