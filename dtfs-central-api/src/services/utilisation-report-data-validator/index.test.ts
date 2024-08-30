import { UTILISATION_REPORT_HEADERS } from '@ukef/dtfs2-common';
import { validateUtilisationReportCsvHeaders, validateUtilisationReportCsvCellData, getHeaderIsMissingErrorMessage } from '.';
import {
  generateUkefFacilityIdError,
  generateBaseCurrencyError,
  generateFacilityUtilisationError,
  generatePaymentCurrencyError,
  generatePaymentExchangeRateError,
} from './utilisation-report-cell-validators';

jest.mock('./utilisation-report-cell-validators', () => ({
  generateUkefFacilityIdError: jest.fn(),
  generateBaseCurrencyError: jest.fn(),
  generateFacilityUtilisationError: jest.fn(),
  generatePaymentCurrencyError: jest.fn(),
  generatePaymentExchangeRateError: jest.fn(),
  generateTotalFeesAccruedCurrencyError: jest.fn(),
  generateTotalFeesAccruedExchangeRateError: jest.fn(),
}));

describe('utilisation-report-validator', () => {
  describe('getHeaderIsMissingErrorMessage', () => {
    it("returns the passed in string followed by the text 'header is missing or spelt incorrectly'", () => {
      // Arrange
      const header = 'some string';

      // Act
      const error = getHeaderIsMissingErrorMessage(header);

      // Assert
      expect(error).toEqual(`${header} header is missing or spelt incorrectly`);
    });
  });

  describe('validateUtilisationReportCsvHeaders', () => {
    it('returns an error if a header is missing', () => {
      const csvDataRowWithMissingHeader = {
        'bank facility reference': { value: 'Britannia Energy GEF', column: 'A', row: 1 },
        exporter: { value: 'test exporter', column: 'C', row: 1 },
        'base currency': { value: 'GBP', column: 'D', row: 1 },
        'facility limit': { value: '600000', column: 'E', row: 1 },
        'facility utilisation': { value: '34538e.54', column: 'F', row: 1 },
        'total fees accrued for the period': { value: '367.23', column: 'G', row: 1 },
        'fees paid to ukef for the period': { value: '367.23', column: 'H', row: 1 },
        'fees paid to ukef currency': { value: 'GBP', column: 'I', row: 1 },
        'payment reference': { value: 'Britannia Energy / 3001175147', column: 'J', row: 1 },
      };

      const { missingHeaderErrors } = validateUtilisationReportCsvHeaders(csvDataRowWithMissingHeader);

      expect(missingHeaderErrors.length).toBe(1);
      expect(missingHeaderErrors[0].errorMessage).toBe('UKEF facility ID header is missing or spelt incorrectly');
    });

    it('returns no errors when no headers are missing', () => {
      const csvDataRowWithCorrectHeaders = {
        'bank facility reference': { value: 'Britannia Energy GEF', column: 'A', row: 1 },
        'ukef facility id': { value: '20001371', column: 'B', row: 1 },
        exporter: { value: 'test exporter', column: 'C', row: 1 },
        'base currency': { value: 'GBP', column: 'D', row: 1 },
        'facility limit': { value: '600000', column: 'E', row: 1 },
        'facility utilisation': { value: '34538e.54', column: 'F', row: 1 },
        'total fees accrued for the period': { value: '367.23', column: 'G', row: 1 },
        'fees paid to ukef for the period': { value: '367.23', column: 'H', row: 1 },
        'fees paid to ukef currency': { value: 'GBP', column: 'I', row: 1 },
        'payment reference': { value: 'Britannia Energy / 3001175147', column: 'J', row: 1 },
      };

      const { missingHeaderErrors } = validateUtilisationReportCsvHeaders(csvDataRowWithCorrectHeaders);

      expect(missingHeaderErrors.length).toBe(0);
    });

    it('returns multiple errors if multiple headers are missing', () => {
      const csvDataRowWithIncorrectlySpeltFacilityIdAndCurrency = {
        'bank facility reference': { value: 'Britannia Energy GEF', column: 'A', row: 1 },
        exporter: { value: 'test exporter', column: 'C', row: 1 },
        'base curency': { value: 'GBP', column: 'D', row: 1 },
        'facility limit': { value: '600000', column: 'E', row: 1 },
        'facility utilisation': { value: '34538e.54', column: 'F', row: 1 },
        'total fees accrued for the period': { value: '367.23', column: 'G', row: 1 },
        'fees paid to ukef for the period': { value: '367.23', column: 'H', row: 1 },
        'payment reference': { value: 'Britannia Energy / 3001175147', column: 'I', row: 1 },
      };

      const { missingHeaderErrors } = validateUtilisationReportCsvHeaders(csvDataRowWithIncorrectlySpeltFacilityIdAndCurrency);

      expect(missingHeaderErrors.length).toBe(3);
      expect(missingHeaderErrors[0].errorMessage).toBe('UKEF facility ID header is missing or spelt incorrectly');
    });
  });

  describe('validateUtilisationReportCsvCellData', () => {
    // This test mocks out all the function from utilisation-report-cell-validators.js and
    // tests that if headers are available then the respective cell validator function is called on that data

    it('calls the generate error functions for headers that are present', () => {
      const csvData = [
        {
          'bank facility reference': { value: 'Britannia Energy GEF', column: 'A', row: 1 },
          'ukef facility id': { value: '20001371', column: 'B', row: 1 },
          exporter: { value: 'test exporter', column: 'C', row: 1 },
          'base currency': { value: 'GBP', column: 'D', row: 1 },
          'facility limit': { value: '600000', column: 'E', row: 1 },
          'facility utilisation': { value: '34538e.54', column: 'F', row: 1 },
          'total fees accrued for the period': { value: '367.23', column: 'G', row: 1 },
          'fees paid to ukef for the period': { value: '367.23', column: 'H', row: 1 },
          'payment reference': { value: 'Britannia Energy / 3001175147', column: 'I', row: 1 },
        },
      ];

      const availableHeaders = [UTILISATION_REPORT_HEADERS.UKEF_FACILITY_ID, UTILISATION_REPORT_HEADERS.BASE_CURRENCY];

      validateUtilisationReportCsvCellData(csvData, availableHeaders);
      expect(generateUkefFacilityIdError).toHaveBeenCalledWith({ value: '20001371', column: 'B', row: 1 }, 'test exporter');
      expect(generateBaseCurrencyError).toHaveBeenCalledWith({ value: 'GBP', column: 'D', row: 1 }, 'test exporter');
      expect(generateFacilityUtilisationError).not.toHaveBeenCalled();
    });

    it('calls the generate payment currency and exchange rate error functions even if no headers are present', () => {
      const csvData = [
        {
          'bank facility reference': { value: 'Britannia Energy GEF', column: 'A', row: 1 },
          'ukef facility id': { value: '20001371', column: 'B', row: 1 },
          exporter: { value: 'test exporter', column: 'C', row: 1 },
          'base currency': { value: 'GBP', column: 'D', row: 1 },
          'facility limit': { value: '600000', column: 'E', row: 1 },
          'facility utilisation': { value: '34538e.54', column: 'F', row: 1 },
          'total fees accrued for the period': { value: '367.23', column: 'G', row: 1 },
          'fees paid to ukef for the period': { value: '367.23', column: 'H', row: 1 },
          'payment reference': { value: 'Britannia Energy / 3001175147', column: 'I', row: 1 },
        },
      ];

      validateUtilisationReportCsvCellData(csvData, []);
      expect(generatePaymentCurrencyError).toHaveBeenCalled();
      expect(generatePaymentExchangeRateError).toHaveBeenCalled();
    });
  });
});
