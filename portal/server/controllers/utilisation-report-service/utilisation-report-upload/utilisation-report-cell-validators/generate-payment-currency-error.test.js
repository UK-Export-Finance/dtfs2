const { generatePaymentCurrencyError } = require('./generate-payment-currency-error');

describe('generatePaymentCurrencyError', () => {
  const testExporterName = 'test-exporter';
  it('returns an error when the value is not a valid ISO 4217 currency code', async () => {
    const invalidPaymentCurrency = {
      value: 'GBPA',
      column: 1,
      row: 1,
    };
    const expectedError = {
      errorMessage: 'Payment currency must be in the ISO 4217 currency code format',
      column: 1,
      row: 1,
      value: 'GBPA',
      exporter: testExporterName,
    };

    const paymentCurrencyError = generatePaymentCurrencyError(invalidPaymentCurrency, testExporterName);

    expect(paymentCurrencyError).toEqual(expectedError);
  });

  it('returns null if the value is a valid ISO 4217 currency code', async () => {
    const validPaymentCurrency = {
      value: 'GBP',
      column: 1,
      row: 1,
    };

    const paymentCurrencyError = generatePaymentCurrencyError(validPaymentCurrency, testExporterName);

    expect(paymentCurrencyError).toEqual(null);
  });
});
