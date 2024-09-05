import { generatePaymentCurrencyError } from './generate-payment-currency-error';

describe('generatePaymentCurrencyError', () => {
  const testExporterName = 'test-exporter';
  it('returns an error when the value is null but payment exchange rate is supplied', () => {
    const csvDataRow = {
      exporter: {
        value: testExporterName,
        column: 'A',
        row: 1,
      },
      'fees paid to ukef currency': {
        value: 'GBP',
        column: 'B',
        row: 1,
      },
      'payment currency': {
        value: null,
        column: 'C',
        row: 1,
      },
      'payment exchange rate': {
        value: '0.97',
        row: 1,
        column: 'D',
      },
    };
    const expectedError = {
      errorMessage: 'Payment currency must have an entry when a payment exchange rate is supplied',
      column: 'C',
      row: 1,
      value: null,
      exporter: testExporterName,
    };

    const paymentCurrencyError = generatePaymentCurrencyError(csvDataRow);

    expect(paymentCurrencyError).toEqual(expectedError);
  });

  it('returns an error when the value is not a valid ISO 4217 currency code', () => {
    const csvDataRow = {
      exporter: {
        value: testExporterName,
        column: 'A',
        row: 1,
      },
      'fees paid to ukef currency': {
        value: 'GBP',
        column: 'B',
        row: 1,
      },
      'payment currency': {
        value: 'USDA',
        column: 'C',
        row: 1,
      },
      'payment exchange rate': {
        value: '0.97',
        row: 1,
        column: 'D',
      },
    };
    const expectedError = {
      errorMessage: 'Payment currency must be in the ISO 4217 currency code format',
      column: 'C',
      row: 1,
      value: 'USDA',
      exporter: testExporterName,
    };

    const paymentCurrencyError = generatePaymentCurrencyError(csvDataRow);

    expect(paymentCurrencyError).toEqual(expectedError);
  });

  it('returns null if the value is a valid ISO 4217 currency code', () => {
    const csvDataRow = {
      exporter: {
        value: testExporterName,
        column: 'A',
        row: 1,
      },
      'fees paid to ukef currency': {
        value: 'GBP',
        column: 'B',
        row: 1,
      },
      'payment currency': {
        value: 'USD',
        column: 'C',
        row: 1,
      },
      'payment exchange rate': {
        value: '0.97',
        row: 1,
        column: 'D',
      },
    };

    const paymentCurrencyError = generatePaymentCurrencyError(csvDataRow);

    expect(paymentCurrencyError).toBeNull();
  });
});
