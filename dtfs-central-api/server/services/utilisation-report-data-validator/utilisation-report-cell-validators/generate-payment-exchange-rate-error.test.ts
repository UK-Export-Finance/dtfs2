import { CURRENCY } from '@ukef/dtfs2-common';
import { generatePaymentExchangeRateError } from './generate-payment-exchange-rate-error';
import { CSV } from '../../../constants/csv';

describe('generatePaymentExchangeRateError', () => {
  const testExporterName = 'test-exporter';
  it('returns null if payment currency is null and payment exchange rate is null', () => {
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
        value: null,
        row: 1,
        column: 'D',
      },
    };

    const exchangeRateError = generatePaymentExchangeRateError(csvDataRow);

    expect(exchangeRateError).toEqual(null);
  });

  it('returns an error if payment currency is null and payment exchange rate is not a number', () => {
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
        value: 'abc',
        row: 1,
        column: 'D',
      },
    };

    const expectedError = {
      errorMessage: 'Payment exchange rate must be a number',
      column: 'D',
      row: 1,
      value: 'abc',
      exporter: testExporterName,
    };

    const exchangeRateError = generatePaymentExchangeRateError(csvDataRow);

    expect(exchangeRateError).toEqual(expectedError);
  });

  it('returns an error if payment currency is null and payment exchange rate is too long', () => {
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
        value: '1.738491847362543',
        row: 1,
        column: 'D',
      },
    };

    const expectedError = {
      errorMessage: `Payment exchange rate must be ${CSV.MAX_CELL_CHARACTER_COUNT} characters or less`,
      column: 'D',
      row: 1,
      value: '1.738491847362543',
      exporter: testExporterName,
    };

    const exchangeRateError = generatePaymentExchangeRateError(csvDataRow);

    expect(exchangeRateError).toEqual(expectedError);
  });

  it('returns null if payment currency is the same as fees paid to ukef currency and payment exchange rate is null', () => {
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
        value: CURRENCY.GBP,
        column: 'C',
        row: 1,
      },
      'payment exchange rate': {
        value: null,
        row: 1,
        column: 'N',
      },
    };

    const exchangeRateError = generatePaymentExchangeRateError(csvDataRow);

    expect(exchangeRateError).toEqual(null);
  });

  it('returns null if payment currency is the same as fees paid to ukef currency and payment exchange rate is 1', () => {
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
        value: CURRENCY.GBP,
        column: 'C',
        row: 1,
      },
      'payment exchange rate': {
        value: '1',
        row: 1,
        column: 'D',
      },
    };

    const exchangeRateError = generatePaymentExchangeRateError(csvDataRow);

    expect(exchangeRateError).toEqual(null);
  });

  it('returns an error if payment currency is the same as fees paid to ukef currency and payment exchange rate is not 1 or null', () => {
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
        value: CURRENCY.GBP,
        column: 'C',
        row: 1,
      },
      'payment exchange rate': {
        value: '2',
        row: 1,
        column: 'D',
      },
    };

    const expectedError = {
      errorMessage: 'Payment exchange rate must be 1 or blank when payment currency and fees paid to UKEF currency are the same',
      column: 'D',
      row: 1,
      value: '2',
      exporter: testExporterName,
    };

    const exchangeRateError = generatePaymentExchangeRateError(csvDataRow);

    expect(exchangeRateError).toEqual(expectedError);
  });

  it('returns null if payment currency is different to fees paid to ukef currency and payment exchange rate is valid', () => {
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
        value: 'USD',
        column: 'C',
        row: 1,
      },
      'payment exchange rate': {
        value: '0.734',
        row: 1,
        column: 'D',
      },
    };

    const exchangeRateError = generatePaymentExchangeRateError(csvDataRow);

    expect(exchangeRateError).toEqual(null);
  });

  it('returns an error if payment currency is different to fees paid to ukef currency and payment exchange rate is null', () => {
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
        value: 'USD',
        column: 'C',
        row: 1,
      },
      'payment exchange rate': {
        value: null,
        row: 1,
        column: 'D',
      },
    };

    const expectedError = {
      errorMessage: 'Payment exchange rate must have an entry when a payment currency is supplied',
      column: 'D',
      row: 1,
      value: null,
      exporter: testExporterName,
    };

    const exchangeRateError = generatePaymentExchangeRateError(csvDataRow);

    expect(exchangeRateError).toEqual(expectedError);
  });

  it('returns an error if payment currency is different to fees paid to ukef currency and payment exchange rate is not a number', () => {
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
        value: 'USD',
        column: 'C',
        row: 1,
      },
      'payment exchange rate': {
        value: 'abc',
        row: 1,
        column: 'D',
      },
    };

    const expectedError = {
      errorMessage: 'Payment exchange rate must be a number',
      column: 'D',
      row: 1,
      value: 'abc',
      exporter: testExporterName,
    };

    const exchangeRateError = generatePaymentExchangeRateError(csvDataRow);

    expect(exchangeRateError).toEqual(expectedError);
  });

  it('returns an error if payment currency is different to fees paid to ukef currency and payment exchange rate is too long', () => {
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
        value: 'USD',
        column: 'C',
        row: 1,
      },
      'payment exchange rate': {
        value: '1.738491847362543',
        row: 1,
        column: 'D',
      },
    };

    const expectedError = {
      errorMessage: `Payment exchange rate must be ${CSV.MAX_CELL_CHARACTER_COUNT} characters or less`,
      column: 'D',
      row: 1,
      value: '1.738491847362543',
      exporter: testExporterName,
    };

    const exchangeRateError = generatePaymentExchangeRateError(csvDataRow);

    expect(exchangeRateError).toEqual(expectedError);
  });
});
