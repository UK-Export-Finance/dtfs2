const { generateTotalFeesAccruedCurrencyError } = require('./generate-total-fees-accrued-currency-error');

describe('generateTotalFeesAccruedCurrencyError', () => {
  const testExporterName = 'test-exporter';
  it('returns an error when the total fees accrued currency is null but payment exchange rate is supplied', async () => {
    const csvDataRow = {
      exporter: {
        value: testExporterName,
        column: 1,
        row: 1,
      },
      'accrual currency': {
        value: null,
        column: 2,
        row: 1,
      },
      'accrual exchange rate': {
        value: '0.78',
        column: 2,
        row: 1,
      },
    };
    const expectedError = {
      errorMessage: 'Accrual currency must have an entry when an accrual exchange rate is supplied',
      column: 2,
      row: 1,
      value: null,
      exporter: testExporterName,
    };

    const paymentCurrencyError = generateTotalFeesAccruedCurrencyError(csvDataRow);

    expect(paymentCurrencyError).toEqual(expectedError);
  });

  it('returns an error when the value is not a valid ISO 4217 currency code', async () => {
    const csvDataRow = {
      exporter: {
        value: testExporterName,
        column: 1,
        row: 1,
      },
      'accrual currency': {
        value: 'GBPA',
        column: 2,
        row: 1,
      },
      'accrual exchange rate': {
        value: '0.97',
        row: 1,
        column: 3,
      },
    };
    const expectedError = {
      errorMessage: 'Accrual currency must be in the ISO 4217 currency code format',
      column: 2,
      row: 1,
      value: 'GBPA',
      exporter: testExporterName,
    };

    const paymentCurrencyError = generateTotalFeesAccruedCurrencyError(csvDataRow);

    expect(paymentCurrencyError).toEqual(expectedError);
  });

  it('returns null if the value is a valid ISO 4217 currency code', async () => {
    const csvDataRow = {
      exporter: {
        value: testExporterName,
        column: 1,
        row: 1,
      },
      'accrual currency': {
        value: 'GBP',
        column: 2,
        row: 1,
      },
      'accrual exchange rate': {
        value: '0.97',
        row: 1,
        column: 3,
      },
    };

    const paymentCurrencyError = generateTotalFeesAccruedCurrencyError(csvDataRow);

    expect(paymentCurrencyError).toEqual(null);
  });
});
