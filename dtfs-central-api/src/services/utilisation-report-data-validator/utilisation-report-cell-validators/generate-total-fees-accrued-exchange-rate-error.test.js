const { generateTotalFeesAccruedExchangeRateError } = require('./generate-total-fees-accrued-exchange-rate-error');
const { FILE_UPLOAD } = require('../../../constants/file-upload');

describe('generateTotalFeesAccruedExchangeRateError', () => {
  const testExporterName = 'test-exporter';
  it('returns null if accrual currency is null and accrual exchange rate is null', async () => {
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
        value: null,
        row: 1,
        column: 3,
      },
    };

    const exchangeRateError = generateTotalFeesAccruedExchangeRateError(csvDataRow);

    expect(exchangeRateError).toEqual(null);
  });

  it('returns an error if accrual currency is null and accrual exchange rate is not a number', async () => {
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
        value: 'abc',
        row: 1,
        column: 3,
      },
    };

    const expectedError = {
      errorMessage: 'Accrual exchange rate must be a number',
      column: 3,
      row: 1,
      value: 'abc',
      exporter: testExporterName,
    };

    const exchangeRateError = generateTotalFeesAccruedExchangeRateError(csvDataRow);

    expect(exchangeRateError).toEqual(expectedError);
  });

  it('returns an error if accrual currency is null and accrual exchange rate is too long', async () => {
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
        value: '1.738491847362543',
        row: 1,
        column: 3,
      },
    };

    const expectedError = {
      errorMessage: `Accrual exchange rate must be ${FILE_UPLOAD.MAX_CELL_CHARACTER_COUNT} characters or less`,
      column: 3,
      row: 1,
      value: '1.738491847362543',
      exporter: testExporterName,
    };

    const exchangeRateError = generateTotalFeesAccruedExchangeRateError(csvDataRow);

    expect(exchangeRateError).toEqual(expectedError);
  });

  it('returns null if accrual currency is the same as base currency and accrual exchange rate is null', async () => {
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
      'base currency': {
        value: 'GBP',
        column: 2,
        row: 1,
      },
      'accrual exchange rate': {
        value: null,
        row: 1,
        column: 3,
      },
    };

    const exchangeRateError = generateTotalFeesAccruedExchangeRateError(csvDataRow);

    expect(exchangeRateError).toEqual(null);
  });

  it('returns null if accrual currency is the same as base currency and accrual exchange rate is 1', async () => {
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
      'base currency': {
        value: 'GBP',
        column: 2,
        row: 1,
      },
      'accrual exchange rate': {
        value: '1',
        row: 1,
        column: 3,
      },
    };

    const exchangeRateError = generateTotalFeesAccruedExchangeRateError(csvDataRow);

    expect(exchangeRateError).toEqual(null);
  });

  it('returns an error if accrual currency is the same as base currency and accrual exchange rate is not 1 or null', async () => {
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
      'base currency': {
        value: 'GBP',
        column: 2,
        row: 1,
      },
      'accrual exchange rate': {
        value: '2',
        row: 1,
        column: 3,
      },
    };

    const expectedError = {
      errorMessage: 'Accrual exchange rate must be 1 or blank when accrual currency and base currency are the same',
      column: 3,
      row: 1,
      value: '2',
      exporter: testExporterName,
    };

    const exchangeRateError = generateTotalFeesAccruedExchangeRateError(csvDataRow);

    expect(exchangeRateError).toEqual(expectedError);
  });

  it('returns null if accrual currency is different to base currency and accrual exchange rate is valid', async () => {
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
      'base currency': {
        value: 'USD',
        column: 2,
        row: 1,
      },
      'accrual exchange rate': {
        value: '0.734',
        row: 1,
        column: 3,
      },
    };

    const exchangeRateError = generateTotalFeesAccruedExchangeRateError(csvDataRow);

    expect(exchangeRateError).toEqual(null);
  });

  it('returns an error if accrual currency is different to base currency and accrual exchange rate is null', async () => {
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
      'base currency': {
        value: 'USD',
        column: 2,
        row: 1,
      },
      'accrual exchange rate': {
        value: null,
        row: 1,
        column: 3,
      },
    };

    const expectedError = {
      errorMessage: 'Accrual exchange rate must have an entry when an accrual currency is supplied',
      column: 3,
      row: 1,
      value: null,
      exporter: testExporterName,
    };

    const exchangeRateError = generateTotalFeesAccruedExchangeRateError(csvDataRow);

    expect(exchangeRateError).toEqual(expectedError);
  });

  it('returns an error if accrual currency is different to base currency and accrual exchange rate is not a number', async () => {
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
      'base currency': {
        value: 'USD',
        column: 2,
        row: 1,
      },
      'accrual exchange rate': {
        value: 'abc',
        row: 1,
        column: 3,
      },
    };

    const expectedError = {
      errorMessage: 'Accrual exchange rate must be a number',
      column: 3,
      row: 1,
      value: 'abc',
      exporter: testExporterName,
    };

    const exchangeRateError = generateTotalFeesAccruedExchangeRateError(csvDataRow);

    expect(exchangeRateError).toEqual(expectedError);
  });

  it('returns an error if accrual currency is different to base currency and accrual exchange rate is too long', async () => {
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
      'base currency': {
        value: 'USD',
        column: 2,
        row: 1,
      },
      'accrual exchange rate': {
        value: '1.738491847362543',
        row: 1,
        column: 3,
      },
    };

    const expectedError = {
      errorMessage: `Accrual exchange rate must be ${FILE_UPLOAD.MAX_CELL_CHARACTER_COUNT} characters or less`,
      column: 3,
      row: 1,
      value: '1.738491847362543',
      exporter: testExporterName,
    };

    const exchangeRateError = generateTotalFeesAccruedExchangeRateError(csvDataRow);

    expect(exchangeRateError).toEqual(expectedError);
  });
});
