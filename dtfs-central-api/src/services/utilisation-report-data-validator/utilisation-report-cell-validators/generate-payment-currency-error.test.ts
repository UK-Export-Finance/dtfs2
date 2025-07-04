import { CURRENCY } from '@ukef/dtfs2-common';
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
        value: CURRENCY.GBP,
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

  it('should return an error when the value is not a valid currency code', () => {
    const csvDataRow = {
      exporter: {
        value: testExporterName,
        column: 'A',
        row: 1,
      },
      'fees paid to ukef currency': {
        value: CURRENCY.GBP,
        column: 'B',
        row: 1,
      },
      'payment currency': {
        value: 'INR',
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
      errorMessage: 'The report can only include the following currencies: GBP, EUR, USD, JPY',
      column: 'C',
      row: 1,
      value: 'INR',
      exporter: testExporterName,
    };

    const paymentCurrencyError = generatePaymentCurrencyError(csvDataRow);

    expect(paymentCurrencyError).toEqual(expectedError);
  });

  it.each(Object.values(CURRENCY))('should return null if the value is "%s"', (currency) => {
    const csvDataRow = {
      exporter: {
        value: testExporterName,
        column: 'A',
        row: 1,
      },
      'fees paid to ukef currency': {
        value: currency,
        column: 'B',
        row: 1,
      },
      'payment currency': {
        value: currency,
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
