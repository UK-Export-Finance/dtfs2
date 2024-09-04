import { UTILISATION_REPORT_HEADERS, UtilisationReportCsvRowData } from '@ukef/dtfs2-common';
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

const requiredHeaders = [
  UTILISATION_REPORT_HEADERS.UKEF_FACILITY_ID,
  UTILISATION_REPORT_HEADERS.BASE_CURRENCY,
  UTILISATION_REPORT_HEADERS.FACILITY_UTILISATION,
  UTILISATION_REPORT_HEADERS.TOTAL_FEES_ACCRUED,
  UTILISATION_REPORT_HEADERS.FEES_PAID_IN_PERIOD,
  UTILISATION_REPORT_HEADERS.FEES_PAID_IN_PERIOD_CURRENCY,
];

const aCsvRowDataWithAllRequiredHeadings = (): UtilisationReportCsvRowData => {
  const rowData: UtilisationReportCsvRowData = {};
  requiredHeaders.forEach((header) => {
    rowData[header] = { value: null, column: 'A', row: 1 };
  });

  return rowData;
};

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
    it.each`
      header                                                     | errorPrefix
      ${UTILISATION_REPORT_HEADERS.UKEF_FACILITY_ID}             | ${'UKEF facility ID'}
      ${UTILISATION_REPORT_HEADERS.BASE_CURRENCY}                | ${'Base currency'}
      ${UTILISATION_REPORT_HEADERS.FACILITY_UTILISATION}         | ${'Facility utilisation'}
      ${UTILISATION_REPORT_HEADERS.TOTAL_FEES_ACCRUED}           | ${'Total fees accrued for the period'}
      ${UTILISATION_REPORT_HEADERS.FEES_PAID_IN_PERIOD}          | ${'Fees paid to UKEF for the period'}
      ${UTILISATION_REPORT_HEADERS.FEES_PAID_IN_PERIOD_CURRENCY} | ${'Fees paid to UKEF currency'}
    `('returns an error if $header header is missing', ({ header, errorPrefix }: { header: string; errorPrefix: string }) => {
      const csvData = aCsvRowDataWithAllRequiredHeadings();
      delete csvData[header];

      const { missingHeaderErrors } = validateUtilisationReportCsvHeaders(csvData);

      expect(missingHeaderErrors.length).toBe(1);
      expect(missingHeaderErrors[0].errorMessage).toBe(`${errorPrefix} header is missing or spelt incorrectly`);
    });

    it('returns no errors when no headers are missing', () => {
      const csvData = aCsvRowDataWithAllRequiredHeadings();

      const { missingHeaderErrors } = validateUtilisationReportCsvHeaders(csvData);

      expect(missingHeaderErrors.length).toBe(0);
    });

    it('returns multiple errors if multiple headers are missing', () => {
      const csvData = aCsvRowDataWithAllRequiredHeadings();
      delete csvData[UTILISATION_REPORT_HEADERS.BASE_CURRENCY];
      delete csvData[UTILISATION_REPORT_HEADERS.FEES_PAID_IN_PERIOD_CURRENCY];
      delete csvData[UTILISATION_REPORT_HEADERS.FACILITY_UTILISATION];
      // This field is facility utilisation but with a typo
      csvData['faculty utilisation'] = { value: '800000', row: 1, column: 'A' };

      const { missingHeaderErrors } = validateUtilisationReportCsvHeaders(csvData);

      expect(missingHeaderErrors.length).toBe(3);
    });
  });

  describe('validateUtilisationReportCsvCellData', () => {
    // This test mocks out all the function from utilisation-report-cell-validators.js and
    // tests that if headers are available then the respective cell validator function is called on that data

    it('calls the generate error functions for headers that are present', () => {
      const csvData = [
        {
          'ukef facility id': { value: '20001371', column: 'B', row: 1 },
          exporter: { value: 'test exporter', column: 'C', row: 1 },
          'base currency': { value: 'GBP', column: 'D', row: 1 },
          'facility utilisation': { value: '34538e.54', column: 'F', row: 1 },
        },
      ];

      const availableHeaders = [UTILISATION_REPORT_HEADERS.UKEF_FACILITY_ID, UTILISATION_REPORT_HEADERS.BASE_CURRENCY];

      validateUtilisationReportCsvCellData(csvData, availableHeaders);
      expect(generateUkefFacilityIdError).toHaveBeenCalledWith(csvData[0]['ukef facility id'], 'test exporter');
      expect(generateBaseCurrencyError).toHaveBeenCalledWith(csvData[0]['base currency'], 'test exporter');
      expect(generateFacilityUtilisationError).not.toHaveBeenCalled();
    });

    it('calls the generate payment currency and exchange rate error functions even if no headers are present', () => {
      const csvData = [{}];
      const availableHeaders: string[] = [];

      validateUtilisationReportCsvCellData(csvData, availableHeaders);

      expect(generatePaymentCurrencyError).toHaveBeenCalled();
      expect(generatePaymentExchangeRateError).toHaveBeenCalled();
    });
  });
});
