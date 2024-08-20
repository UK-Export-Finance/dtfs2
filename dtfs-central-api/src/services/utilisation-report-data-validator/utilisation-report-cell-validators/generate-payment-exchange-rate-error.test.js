const { generatePaymentExchangeRateError } = require('./generate-payment-exchange-rate-error');
const { FILE_UPLOAD } = require('../../../constants/file-upload');

describe('generatePaymentExchangeRateError', () => {
  const testExporterName = 'test-exporter';
  it('returns null if payment currency is null and payment exchange rate is null', async () => {
    const csvDataRow = {
      exporter: {
        value: testExporterName,
        column: 1,
        row: 1,
      },
      'fees paid to ukef currency': {
        value: 'GBP',
        column: 2,
        row: 1,
      },
      'payment currency': {
        value: null,
        column: 2,
        row: 1,
      },
      'payment exchange rate': {
        value: null,
        row: 1,
        column: 3,
      },
    };

    const exchangeRateError = generatePaymentExchangeRateError(csvDataRow);

    expect(exchangeRateError).toEqual(null);
  });

  it('returns an error if payment currency is null and payment exchange rate is not a number', async () => {
    const csvDataRow = {
      exporter: {
        value: testExporterName,
        column: 1,
        row: 1,
      },
      'fees paid to ukef currency': {
        value: 'GBP',
        column: 2,
        row: 1,
      },
      'payment currency': {
        value: null,
        column: 2,
        row: 1,
      },
      'payment exchange rate': {
        value: 'abc',
        row: 1,
        column: 3,
      },
    };

    const expectedError = {
      errorMessage: 'Payment exchange rate must be a number',
      column: 3,
      row: 1,
      value: 'abc',
      exporter: testExporterName,
    };

    const exchangeRateError = generatePaymentExchangeRateError(csvDataRow);

    expect(exchangeRateError).toEqual(expectedError);
  });

  it('returns an error if payment currency is null and payment exchange rate is too long', async () => {
    const csvDataRow = {
      exporter: {
        value: testExporterName,
        column: 1,
        row: 1,
      },
      'fees paid to ukef currency': {
        value: 'GBP',
        column: 2,
        row: 1,
      },
      'payment currency': {
        value: null,
        column: 2,
        row: 1,
      },
      'payment exchange rate': {
        value: '1.738491847362543',
        row: 1,
        column: 3,
      },
    };

    const expectedError = {
      errorMessage: `Payment exchange rate must be ${FILE_UPLOAD.MAX_CELL_CHARACTER_COUNT} characters or less`,
      column: 3,
      row: 1,
      value: '1.738491847362543',
      exporter: testExporterName,
    };

    const exchangeRateError = generatePaymentExchangeRateError(csvDataRow);

    expect(exchangeRateError).toEqual(expectedError);
  });

  it('returns null if payment currency is the same as fees paid to ukef currency and payment exchange rate is null', async () => {
    const csvDataRow = {
      exporter: {
        value: testExporterName,
        column: 1,
        row: 1,
      },
      'fees paid to ukef currency': {
        value: 'GBP',
        column: 2,
        row: 1,
      },
      'payment currency': {
        value: 'GBP',
        column: 2,
        row: 1,
      },
      'payment exchange rate': {
        value: null,
        row: 1,
        column: 3,
      },
    };

    const exchangeRateError = generatePaymentExchangeRateError(csvDataRow);

    expect(exchangeRateError).toEqual(null);
  });

  it('returns null if payment currency is the same as fees paid to ukef currency and payment exchange rate is 1', async () => {
    const csvDataRow = {
      exporter: {
        value: testExporterName,
        column: 1,
        row: 1,
      },
      'fees paid to ukef currency': {
        value: 'GBP',
        column: 2,
        row: 1,
      },
      'payment currency': {
        value: 'GBP',
        column: 2,
        row: 1,
      },
      'payment exchange rate': {
        value: '1',
        row: 1,
        column: 3,
      },
    };

    const exchangeRateError = generatePaymentExchangeRateError(csvDataRow);

    expect(exchangeRateError).toEqual(null);
  });

  it('returns an error if payment currency is the same as fees paid to ukef currency and payment exchange rate is not 1 or null', async () => {
    const csvDataRow = {
      exporter: {
        value: testExporterName,
        column: 1,
        row: 1,
      },
      'fees paid to ukef currency': {
        value: 'GBP',
        column: 2,
        row: 1,
      },
      'payment currency': {
        value: 'GBP',
        column: 2,
        row: 1,
      },
      'payment exchange rate': {
        value: '2',
        row: 1,
        column: 3,
      },
    };

    const expectedError = {
      errorMessage: 'Payment exchange rate must be 1 or blank when payment currency and fees paid to UKEF currency are the same',
      column: 3,
      row: 1,
      value: '2',
      exporter: testExporterName,
    };

    const exchangeRateError = generatePaymentExchangeRateError(csvDataRow);

    expect(exchangeRateError).toEqual(expectedError);
  });

  it('returns null if payment currency is different to fees paid to ukef currency and payment exchange rate is valid', async () => {
    const csvDataRow = {
      exporter: {
        value: testExporterName,
        column: 1,
        row: 1,
      },
      'fees paid to ukef currency': {
        value: 'GBP',
        column: 2,
        row: 1,
      },
      'payment currency': {
        value: 'USD',
        column: 2,
        row: 1,
      },
      'payment exchange rate': {
        value: '0.734',
        row: 1,
        column: 3,
      },
    };

    const exchangeRateError = generatePaymentExchangeRateError(csvDataRow);

    expect(exchangeRateError).toEqual(null);
  });

  it('returns an error if payment currency is different to fees paid to ukef currency and payment exchange rate is null', async () => {
    const csvDataRow = {
      exporter: {
        value: testExporterName,
        column: 1,
        row: 1,
      },
      'fees paid to ukef currency': {
        value: 'GBP',
        column: 2,
        row: 1,
      },
      'payment currency': {
        value: 'USD',
        column: 2,
        row: 1,
      },
      'payment exchange rate': {
        value: null,
        row: 1,
        column: 3,
      },
    };

    const expectedError = {
      errorMessage: 'Payment exchange rate must have an entry when a payment currency is supplied',
      column: 3,
      row: 1,
      value: null,
      exporter: testExporterName,
    };

    const exchangeRateError = generatePaymentExchangeRateError(csvDataRow);

    expect(exchangeRateError).toEqual(expectedError);
  });

  it('returns an error if payment currency is different to fees paid to ukef currency and payment exchange rate is not a number', async () => {
    const csvDataRow = {
      exporter: {
        value: testExporterName,
        column: 1,
        row: 1,
      },
      'fees paid to ukef currency': {
        value: 'GBP',
        column: 2,
        row: 1,
      },
      'payment currency': {
        value: 'USD',
        column: 2,
        row: 1,
      },
      'payment exchange rate': {
        value: 'abc',
        row: 1,
        column: 3,
      },
    };

    const expectedError = {
      errorMessage: 'Payment exchange rate must be a number',
      column: 3,
      row: 1,
      value: 'abc',
      exporter: testExporterName,
    };

    const exchangeRateError = generatePaymentExchangeRateError(csvDataRow);

    expect(exchangeRateError).toEqual(expectedError);
  });

  it('returns an error if payment currency is different to fees paid to ukef currency and payment exchange rate is too long', async () => {
    const csvDataRow = {
      exporter: {
        value: testExporterName,
        column: 1,
        row: 1,
      },
      'fees paid to ukef currency': {
        value: 'GBP',
        column: 2,
        row: 1,
      },
      'payment currency': {
        value: 'USD',
        column: 2,
        row: 1,
      },
      'payment exchange rate': {
        value: '1.738491847362543',
        row: 1,
        column: 3,
      },
    };

    const expectedError = {
      errorMessage: `Payment exchange rate must be ${FILE_UPLOAD.MAX_CELL_CHARACTER_COUNT} characters or less`,
      column: 3,
      row: 1,
      value: '1.738491847362543',
      exporter: testExporterName,
    };

    const exchangeRateError = generatePaymentExchangeRateError(csvDataRow);

    expect(exchangeRateError).toEqual(expectedError);
  });
});
