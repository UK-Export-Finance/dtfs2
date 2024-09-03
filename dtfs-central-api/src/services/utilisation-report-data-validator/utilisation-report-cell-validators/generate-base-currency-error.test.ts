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

  it('returns an error when the value is not a valid ISO 4217 currency code', () => {
    const invalidBaseCurrency = {
      value: 'GBPA',
      column: 'B',
      row: 1,
    };
    const expectedError = {
      errorMessage: 'Base currency must be in the ISO 4217 currency code format',
      column: 'B',
      row: 1,
      value: 'GBPA',
      exporter: testExporterName,
    };

    const baseCurrencyError = generateBaseCurrencyError(invalidBaseCurrency, testExporterName);

    expect(baseCurrencyError).toEqual(expectedError);
  });

  it('returns null if the value is a valid currency', () => {
    const validBaseCurrency = {
      value: 'GBP',
      column: 'C',
      row: 1,
    };

    const baseCurrencyError = generateBaseCurrencyError(validBaseCurrency, testExporterName);

    expect(baseCurrencyError).toBeNull();
  });
});
