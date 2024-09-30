import { UTILISATION_REPORT_HEADERS } from '@ukef/dtfs2-common';
import { validateCells } from '.';
import {
  generateUkefFacilityIdError,
  generateBaseCurrencyError,
  generateFacilityUtilisationError,
  generatePaymentCurrencyError,
  generatePaymentExchangeRateError,
} from '../..';

jest.mock('../..', () => ({
  generateUkefFacilityIdError: jest.fn(),
  generateBaseCurrencyError: jest.fn(),
  generateFacilityUtilisationError: jest.fn(),
  generatePaymentCurrencyError: jest.fn(),
  generatePaymentExchangeRateError: jest.fn(),
  generateTotalFeesAccruedCurrencyError: jest.fn(),
  generateTotalFeesAccruedExchangeRateError: jest.fn(),
}));

describe('validateCells', () => {
  // This test mocks out all the function from utilisation-report-cell-validators.js and
  // tests that if headers are available then the respective cell validator function is called on that data

  it('calls the generate error functions for headers that are present', async () => {
    // Arrange
    const csvData = [
      {
        'ukef facility id': { value: '20001371', column: 'B', row: 1 },
        exporter: { value: 'test exporter', column: 'C', row: 1 },
        'base currency': { value: 'GBP', column: 'D', row: 1 },
        'facility utilisation': { value: '34538.54', column: 'F', row: 1 },
      },
    ];

    const availableHeaders = [UTILISATION_REPORT_HEADERS.UKEF_FACILITY_ID, UTILISATION_REPORT_HEADERS.BASE_CURRENCY];

    // Act
    await validateCells(csvData, availableHeaders);

    // Assert
    expect(generateUkefFacilityIdError).toHaveBeenCalledWith(csvData[0]['ukef facility id'], 'test exporter');
    expect(generateBaseCurrencyError).toHaveBeenCalledWith(csvData[0]['base currency'], 'test exporter');
    expect(generateFacilityUtilisationError).not.toHaveBeenCalled();
  });

  it('calls the generate payment currency and exchange rate error functions even if no headers are present', async () => {
    // Arrange
    const csvData = [{}];
    const availableHeaders: string[] = [];

    // Act
    await validateCells(csvData, availableHeaders);

    // Assert
    expect(generatePaymentCurrencyError).toHaveBeenCalled();
    expect(generatePaymentExchangeRateError).toHaveBeenCalled();
  });
});
