import { CURRENCY } from '@ukef/dtfs2-common';
import { generateBaseCurrencyError } from './generate-base-currency-error';

describe('generateBaseCurrencyError', () => {
  const testExporterName = 'test-exporter';
  it('returns an error when the value is missing', () => {
    const nullBaseCurrency = {
      value: null,
      column: 'A',
      row: 1,
    };
    const expectedError = {
      errorMessage: 'Base currency must have an entry',
      column: 'A',
      row: 1,
      value: null,
      exporter: testExporterName,
    };

    const baseCurrencyError = generateBaseCurrencyError(nullBaseCurrency, testExporterName);

    expect(baseCurrencyError).toEqual(expectedError);
  });

  it('returns an error when the value is not a valid currency', () => {
    const invalidBaseCurrency = {
      value: 'INR',
      column: 'B',
      row: 1,
    };
    const expectedError = {
      errorMessage: 'The report can only include the following currencies: GBP, EUR, USD, JPY',
      column: 'B',
      row: 1,
      value: 'INR',
      exporter: testExporterName,
    };

    const baseCurrencyError = generateBaseCurrencyError(invalidBaseCurrency, testExporterName);

    expect(baseCurrencyError).toEqual(expectedError);
  });

  it.each(Object.values(CURRENCY))('should return null if the value is "%s"', (currency) => {
    const validBaseCurrency = {
      value: currency,
      column: 'C',
      row: 1,
    };

    const baseCurrencyError = generateBaseCurrencyError(validBaseCurrency, testExporterName);

    expect(baseCurrencyError).toBeNull();
  });
});
