import { CURRENCY } from '@ukef/dtfs2-common';
import { generateTotalFeesAccruedCurrencyError } from './generate-total-fees-accrued-currency-error';

describe('generateTotalFeesAccruedCurrencyError', () => {
  const testExporterName = 'test-exporter';
  it('returns an error when the total fees accrued currency is null but payment exchange rate is supplied', () => {
    const csvDataRow = {
      exporter: {
        value: testExporterName,
        column: 'A',
        row: 1,
      },
      'accrual currency': {
        value: null,
        column: 'B',
        row: 1,
      },
      'accrual exchange rate': {
        value: '0.78',
        column: 'C',
        row: 1,
      },
    };
    const expectedError = {
      errorMessage: 'Accrual currency must have an entry when an accrual exchange rate is supplied',
      column: 'B',
      row: 1,
      value: null,
      exporter: testExporterName,
    };

    const paymentCurrencyError = generateTotalFeesAccruedCurrencyError(csvDataRow);

    expect(paymentCurrencyError).toEqual(expectedError);
  });

  it('should return an error when the value is not a valid ISO 4217 code', () => {
    const csvDataRow = {
      exporter: {
        value: testExporterName,
        column: 'A',
        row: 1,
      },
      'accrual currency': {
        value: 'INRA',
        column: 'B',
        row: 1,
      },
      'accrual exchange rate': {
        value: '0.97',
        row: 1,
        column: 'C',
      },
    };
    const expectedError = {
      errorMessage: 'Accrual currency must be in the ISO 4217 currency code format',
      column: 'B',
      row: 1,
      value: 'INRA',
      exporter: testExporterName,
    };

    const paymentCurrencyError = generateTotalFeesAccruedCurrencyError(csvDataRow);

    expect(paymentCurrencyError).toEqual(expectedError);
  });

  const currencyValues = [...Object.values(CURRENCY), 'INR', 'AUD', 'CAD', 'CHF', 'CNY', 'SEK', 'NZD', 'MXN', 'SGD', 'HKD', 'NOK', 'KRW', 'TRY', 'RUB', 'INR'];

  it.each(Object.values(currencyValues))('should return null if the value is "%s"', (currency) => {
    const csvDataRow = {
      exporter: {
        value: testExporterName,
        column: 'A',
        row: 1,
      },
      'accrual currency': {
        value: currency,
        column: 'B',
        row: 1,
      },
      'accrual exchange rate': {
        value: '0.97',
        row: 1,
        column: 'C',
      },
    };

    const paymentCurrencyError = generateTotalFeesAccruedCurrencyError(csvDataRow);

    expect(paymentCurrencyError).toBeNull();
  });
});
