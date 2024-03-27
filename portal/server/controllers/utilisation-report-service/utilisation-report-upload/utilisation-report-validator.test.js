const { validateCsvHeaders, validateCsvCellData, validateFilenameFormat } = require('./utilisation-report-validator');
const { UTILISATION_REPORT_HEADERS, MONTH_NAMES, FILE_UPLOAD } = require('../../../constants');
const {
  generateUkefFacilityIdError,
  generateBaseCurrencyError,
  generateFacilityUtilisationError,
  generatePaymentCurrencyError,
  generatePaymentExchangeRateError,
} = require('./utilisation-report-cell-validators');

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
  describe('validateCsvHeaders', () => {
    it('returns an error if a header is missing', async () => {
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

      const { missingHeaderErrors } = validateCsvHeaders(csvDataRowWithMissingHeader);

      expect(missingHeaderErrors.length).toBe(1);
      expect(missingHeaderErrors[0].errorMessage).toBe('UKEF facility ID header is missing or spelt incorrectly');
    });

    it('returns no errors when no headers are missing', async () => {
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

      const { missingHeaderErrors } = validateCsvHeaders(csvDataRowWithCorrectHeaders);

      expect(missingHeaderErrors.length).toBe(0);
    });

    it('returns multiple errors if multiple headers are missing', async () => {
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

      const { missingHeaderErrors } = validateCsvHeaders(csvDataRowWithIncorrectlySpeltFacilityIdAndCurrency);

      expect(missingHeaderErrors.length).toBe(3);
      expect(missingHeaderErrors[0].errorMessage).toBe('UKEF facility ID header is missing or spelt incorrectly');
    });
  });

  describe('validateCsvCellData', () => {
    // This test mocks out all the function from utilisation-report-cell-validators.js and
    // tests that if headers are available then the respective cell validator function is called on that data

    it('calls the generate error functions for headers that are present', async () => {
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

      validateCsvCellData(csvData, availableHeaders);
      expect(generateUkefFacilityIdError).toHaveBeenCalledWith({ value: '20001371', column: 'B', row: 1 }, 'test exporter');
      expect(generateBaseCurrencyError).toHaveBeenCalledWith({ value: 'GBP', column: 'D', row: 1 }, 'test exporter');
      expect(generateFacilityUtilisationError).not.toHaveBeenCalled();
    });

    it('calls the generate payment currency and exchange rate error functions even if no headers are present', async () => {
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

      const availableHeaders = [];

      validateCsvCellData(csvData, availableHeaders);
      expect(generatePaymentCurrencyError).toHaveBeenCalled();
      expect(generatePaymentExchangeRateError).toHaveBeenCalled();
    });
  });

  describe('validateFilenameFormat', () => {
    it(`should return an error when the filename contains '${FILE_UPLOAD.FILENAME_SUBMITTED_INDICATOR}'`, () => {
      // Arrange
      const month = 1;
      const year = 2024;
      const filename = `Bank_monthly_${month}_${year}_${FILE_UPLOAD.FILENAME_SUBMITTED_INDICATOR}.xlsx`;
      const dueReportPeriod = {
        start: { month, year },
        end: { month, year },
      };

      // Act
      const { filenameError } = validateFilenameFormat(filename, dueReportPeriod);

      // Assert
      expect(filenameError).toBe(`Report filename must not contain '${FILE_UPLOAD.FILENAME_SUBMITTED_INDICATOR}'`);
    });

    describe('when the due report period is a monthly report period', () => {
      const allMonths = Object.values(MONTH_NAMES);
      describe.each(allMonths)('when the month is $long', ({ long, short, numeric, index }) => {
        const year = 2024;
        const dueReportPeriod = {
          start: { month: index, year },
          end: { month: index, year },
        };

        describe.each(['-', '_'])("when the separator is '%s'", (separator) => {
          it.each([long, short, numeric])("should return no errors when the filename contains '%s' and the correct year", (monthIdentifier) => {
            // Arrange
            const filename = `Monthly Bank${separator}${monthIdentifier}${separator}${year}.xlsx`;

            // Act
            const { filenameError } = validateFilenameFormat(filename, dueReportPeriod);

            // Assert
            expect(filenameError).toBeUndefined();
          });
        });

        it('should return an error with an example filename when the filename contains an incorrect year', () => {
          // Arrange
          const incorrectYear = year - 1;
          const filename = `Monthly Bank-${short}-${incorrectYear}.xlsx`;

          const exampleFilenameReportPeriod = `${numeric}-${year}`;

          // Act
          const { filenameError } = validateFilenameFormat(filename, dueReportPeriod);

          // Assert
          expect(filenameError).toBe(`The selected file must contain the reporting period as part of its name, for example '${exampleFilenameReportPeriod}'`);
        });
      });

      it("should return an error when the filename does not contain the word 'monthly'", () => {
        // Arrange
        const filename = 'Bank_report.xlsx';
        const dueReportPeriod = {
          start: { month: 1, year: 2024 },
          end: { month: 1, year: 2024 },
        };

        // Act
        const { filenameError } = validateFilenameFormat(filename, dueReportPeriod);

        // Assert
        expect(filenameError).toBe("The selected file must contain the word 'monthly'");
      });
    });

    describe('when the due report period is quarterly in the same year', () => {
      const startMonth = 1;
      const endMonth = 3;
      const year = 2024;

      const dueQuarterlyReportPeriod = {
        start: { month: startMonth, year },
        end: { month: endMonth, year },
      };

      const endMonthNames = Object.values(MONTH_NAMES)
        .filter(({ index }) => index === endMonth)
        .map(({ long, short, numeric }) => [long, short, numeric])[0];

      it.each(endMonthNames)("returns no errors when the end month identifier is '%s'", (endMonthIdentifier) => {
        // Arrange
        const filename = `Quarterly Bank_${endMonthIdentifier}_${year}.xlsx`;

        // Act
        const { filenameError } = validateFilenameFormat(filename, dueQuarterlyReportPeriod);

        // Assert
        expect(filenameError).toBeUndefined();
      });

      it('should return an error with an example filename when the filename contains an incorrect year', () => {
        // Arrange
        const incorrectYear = year - 1;
        const filename = `Quarterly Bank_${endMonthNames[0]}_${incorrectYear}.xlsx`;

        const exampleFilenameReportPeriod = `0${endMonth}-${year}`;

        // Act
        const { filenameError } = validateFilenameFormat(filename, dueQuarterlyReportPeriod);

        // Assert
        expect(filenameError).toBe(`The selected file must contain the reporting period as part of its name, for example '${exampleFilenameReportPeriod}'`);
      });

      it("should return an error when the filename does not contain the word 'quarterly'", () => {
        // Arrange
        const filename = 'Bank_report.xlsx';

        // Act
        const { filenameError } = validateFilenameFormat(filename, dueQuarterlyReportPeriod);

        // Assert
        expect(filenameError).toBe("The selected file must contain the word 'quarterly'");
      });
    });

    describe('when the due report period is quarterly in an overlapping year', () => {
      const startMonth = 11;
      const startYear = 2023;
      const endMonth = 2;
      const endYear = 2024;

      const dueQuarterlyReportPeriod = {
        start: { month: startMonth, year: startYear },
        end: { month: endMonth, year: endYear },
      };

      const endMonthNames = Object.values(MONTH_NAMES)
        .filter(({ index }) => index === endMonth)
        .map(({ long, short, numeric }) => [long, short, numeric])[0];

      it.each(endMonthNames)("returns no errors when the end month identifier is '%s'", (endMonthIdentifier) => {
        // Arrange
        const filename = `Quarterly Bank_${endMonthIdentifier}_${endYear}.xlsx`;

        // Act
        const { filenameError } = validateFilenameFormat(filename, dueQuarterlyReportPeriod);

        // Assert
        expect(filenameError).toBeUndefined();
      });

      it('should return an error with an example filename when the filename contains an incorrect start year', () => {
        // Arrange
        const incorrectYear = endYear - 1;
        const filename = `Quarterly Bank_${endMonthNames[0]}_${incorrectYear}.xlsx`;

        const exampleFilenameReportPeriod = `0${endMonth}-${endYear}`;

        // Act
        const { filenameError } = validateFilenameFormat(filename, dueQuarterlyReportPeriod);

        // Assert
        expect(filenameError).toBe(`The selected file must contain the reporting period as part of its name, for example '${exampleFilenameReportPeriod}'`);
      });

      it('should return an error with an example filename when the filename contains an incorrect end year', () => {
        // Arrange
        const incorrectYear = endYear - 1;
        const filename = `Quarterly Bank_${endMonthNames[0]}_${incorrectYear}.xlsx`;

        const exampleFilenameReportPeriod = `0${endMonth}-${endYear}`;

        // Act
        const { filenameError } = validateFilenameFormat(filename, dueQuarterlyReportPeriod);

        // Assert
        expect(filenameError).toBe(`The selected file must contain the reporting period as part of its name, for example '${exampleFilenameReportPeriod}'`);
      });

      it("should return an error when the filename does not contain the word 'quarterly'", () => {
        // Arrange
        const filename = 'Bank_report.xlsx';

        // Act
        const { filenameError } = validateFilenameFormat(filename, dueQuarterlyReportPeriod);

        // Assert
        expect(filenameError).toBe("The selected file must contain the word 'quarterly'");
      });
    });
  });
});
