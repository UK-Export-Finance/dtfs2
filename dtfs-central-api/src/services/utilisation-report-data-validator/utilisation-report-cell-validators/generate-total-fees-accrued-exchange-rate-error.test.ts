import { generateTotalFeesAccruedExchangeRateError } from './generate-total-fees-accrued-exchange-rate-error';
import { FILE_UPLOAD } from '../../../constants/file-upload';

describe('generateTotalFeesAccruedExchangeRateError', () => {
  const testExporterName = 'test-exporter';
  it('returns null if accrual currency is null and accrual exchange rate is null', () => {
    const csvDataRow = {
      exporter: {
        value: testExporterName,
        column: 'C',
        row: 1,
      },
      'accrual currency': {
        value: null,
        column: 'D',
        row: 1,
      },
      'accrual exchange rate': {
        value: null,
        row: 1,
        column: 'E',
      },
    };

    const exchangeRateError = generateTotalFeesAccruedExchangeRateError(csvDataRow);

    expect(exchangeRateError).toEqual(null);
  });

  it('returns an error if accrual currency is null and accrual exchange rate is not a number', () => {
    const csvDataRow = {
      exporter: {
        value: testExporterName,
        column: 'C',
        row: 1,
      },
      'accrual currency': {
        value: null,
        column: 'D',
        row: 1,
      },
      'accrual exchange rate': {
        value: 'abc',
        row: 1,
        column: 'E',
      },
    };

    const expectedError = {
      errorMessage: 'Accrual exchange rate must be a number',
      column: 'E',
      row: 1,
      value: 'abc',
      exporter: testExporterName,
    };

    const exchangeRateError = generateTotalFeesAccruedExchangeRateError(csvDataRow);

    expect(exchangeRateError).toEqual(expectedError);
  });

  it('returns an error if accrual currency is null and accrual exchange rate is too long', () => {
    const csvDataRow = {
      exporter: {
        value: testExporterName,
        column: 'C',
        row: 1,
      },
      'accrual currency': {
        value: null,
        column: 'D',
        row: 1,
      },
      'accrual exchange rate': {
        value: '1.738491847362543',
        row: 1,
        column: 'E',
      },
    };

    const expectedError = {
      errorMessage: `Accrual exchange rate must be ${FILE_UPLOAD.MAX_CELL_CHARACTER_COUNT} characters or less`,
      column: 'E',
      row: 1,
      value: '1.738491847362543',
      exporter: testExporterName,
    };

    const exchangeRateError = generateTotalFeesAccruedExchangeRateError(csvDataRow);

    expect(exchangeRateError).toEqual(expectedError);
  });

  it('returns null if accrual currency is the same as base currency and accrual exchange rate is null', () => {
    const csvDataRow = {
      exporter: {
        value: testExporterName,
        column: 'C',
        row: 1,
      },
      'accrual currency': {
        value: 'GBP',
        column: 'D',
        row: 1,
      },
      'base currency': {
        value: 'GBP',
        column: 'E',
        row: 1,
      },
      'accrual exchange rate': {
        value: null,
        row: 1,
        column: 'F',
      },
    };

    const exchangeRateError = generateTotalFeesAccruedExchangeRateError(csvDataRow);

    expect(exchangeRateError).toEqual(null);
  });

  it('returns null if accrual currency is the same as base currency and accrual exchange rate is 1', () => {
    const csvDataRow = {
      exporter: {
        value: testExporterName,
        column: 'C',
        row: 1,
      },
      'accrual currency': {
        value: 'GBP',
        column: 'D',
        row: 1,
      },
      'base currency': {
        value: 'GBP',
        column: 'E',
        row: 1,
      },
      'accrual exchange rate': {
        value: '1',
        row: 1,
        column: 'F',
      },
    };

    const exchangeRateError = generateTotalFeesAccruedExchangeRateError(csvDataRow);

    expect(exchangeRateError).toEqual(null);
  });

  it('returns an error if accrual currency is the same as base currency and accrual exchange rate is not 1 or null', () => {
    const csvDataRow = {
      exporter: {
        value: testExporterName,
        column: 'C',
        row: 1,
      },
      'accrual currency': {
        value: 'GBP',
        column: 'D',
        row: 1,
      },
      'base currency': {
        value: 'GBP',
        column: 'E',
        row: 1,
      },
      'accrual exchange rate': {
        value: '2',
        row: 1,
        column: 'F',
      },
    };

    const expectedError = {
      errorMessage: 'Accrual exchange rate must be 1 or blank when accrual currency and base currency are the same',
      column: 'F',
      row: 1,
      value: '2',
      exporter: testExporterName,
    };

    const exchangeRateError = generateTotalFeesAccruedExchangeRateError(csvDataRow);

    expect(exchangeRateError).toEqual(expectedError);
  });

  it('returns null if accrual currency is different to base currency and accrual exchange rate is valid', () => {
    const csvDataRow = {
      exporter: {
        value: testExporterName,
        column: 'C',
        row: 1,
      },
      'accrual currency': {
        value: 'GBP',
        column: 'D',
        row: 1,
      },
      'base currency': {
        value: 'USD',
        column: 'E',
        row: 1,
      },
      'accrual exchange rate': {
        value: '0.734',
        row: 1,
        column: 'F',
      },
    };

    const exchangeRateError = generateTotalFeesAccruedExchangeRateError(csvDataRow);

    expect(exchangeRateError).toEqual(null);
  });

  it('returns an error if accrual currency is different to base currency and accrual exchange rate is null', () => {
    const csvDataRow = {
      exporter: {
        value: testExporterName,
        column: 'C',
        row: 1,
      },
      'accrual currency': {
        value: 'GBP',
        column: 'D',
        row: 1,
      },
      'base currency': {
        value: 'USD',
        column: 'E',
        row: 1,
      },
      'accrual exchange rate': {
        value: null,
        row: 1,
        column: 'F',
      },
    };

    const expectedError = {
      errorMessage: 'Accrual exchange rate must have an entry when an accrual currency is supplied',
      column: 'F',
      row: 1,
      value: null,
      exporter: testExporterName,
    };

    const exchangeRateError = generateTotalFeesAccruedExchangeRateError(csvDataRow);

    expect(exchangeRateError).toEqual(expectedError);
  });

  it('returns an error if accrual currency is different to base currency and accrual exchange rate is not a number', () => {
    const csvDataRow = {
      exporter: {
        value: testExporterName,
        column: 'C',
        row: 1,
      },
      'accrual currency': {
        value: 'GBP',
        column: 'D',
        row: 1,
      },
      'base currency': {
        value: 'USD',
        column: 'E',
        row: 1,
      },
      'accrual exchange rate': {
        value: 'abc',
        row: 1,
        column: 'F',
      },
    };

    const expectedError = {
      errorMessage: 'Accrual exchange rate must be a number',
      column: 'F',
      row: 1,
      value: 'abc',
      exporter: testExporterName,
    };

    const exchangeRateError = generateTotalFeesAccruedExchangeRateError(csvDataRow);

    expect(exchangeRateError).toEqual(expectedError);
  });

  it('returns an error if accrual currency is different to base currency and accrual exchange rate is too long', () => {
    const csvDataRow = {
      exporter: {
        value: testExporterName,
        column: 'C',
        row: 1,
      },
      'accrual currency': {
        value: 'GBP',
        column: 'D',
        row: 1,
      },
      'base currency': {
        value: 'USD',
        column: 'E',
        row: 1,
      },
      'accrual exchange rate': {
        value: '1.738491847362543',
        row: 1,
        column: 'F',
      },
    };

    const expectedError = {
      errorMessage: `Accrual exchange rate must be ${FILE_UPLOAD.MAX_CELL_CHARACTER_COUNT} characters or less`,
      column: 'F',
      row: 1,
      value: '1.738491847362543',
      exporter: testExporterName,
    };

    const exchangeRateError = generateTotalFeesAccruedExchangeRateError(csvDataRow);

    expect(exchangeRateError).toEqual(expectedError);
  });
});
