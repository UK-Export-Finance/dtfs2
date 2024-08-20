const { generateMonthlyFeesPaidCurrencyError } = require('./generate-monthly-fees-paid-currency-error');

describe('generateMonthlyFeesPaidCurrencyError', () => {
  const testExporterName = 'test-exporter';
  it('returns an error when the value is missing', async () => {
    const nullMonthlyFeesPaidCurrency = {
      value: null,
      column: 1,
      row: 1,
    };
    const expectedError = {
      errorMessage: 'Fees paid to UKEF currency must have an entry',
      column: 1,
      row: 1,
      value: null,
      exporter: testExporterName,
    };

    const monthlyFeesPaidToUkefCurrencyError = generateMonthlyFeesPaidCurrencyError(nullMonthlyFeesPaidCurrency, testExporterName);

    expect(monthlyFeesPaidToUkefCurrencyError).toEqual(expectedError);
  });

  it('returns an error when the value is not a valid ISO 4217 currency code', async () => {
    const invalidBaseCurrency = {
      value: 'GBPA',
      column: 1,
      row: 1,
    };
    const expectedError = {
      errorMessage: 'Fees paid to UKEF currency must be in the ISO 4217 currency code format',
      column: 1,
      row: 1,
      value: 'GBPA',
      exporter: testExporterName,
    };

    const monthlyFeesPaidToUkefCurrencyError = generateMonthlyFeesPaidCurrencyError(invalidBaseCurrency, testExporterName);

    expect(monthlyFeesPaidToUkefCurrencyError).toEqual(expectedError);
  });

  it('returns null if the value is a valid currency', async () => {
    const validBaseCurrency = {
      value: 'GBP',
      column: 1,
      row: 1,
    };

    const monthlyFeesPaidToUkefCurrencyError = generateMonthlyFeesPaidCurrencyError(validBaseCurrency, testExporterName);

    expect(monthlyFeesPaidToUkefCurrencyError).toEqual(null);
  });
});
