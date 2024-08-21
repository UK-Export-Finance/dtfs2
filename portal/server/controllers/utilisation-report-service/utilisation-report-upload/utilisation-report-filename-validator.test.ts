import { validateFilenameFormat } from './utilisation-report-filename-validator';
import { MONTH_NAMES, FILE_UPLOAD } from '../../../constants';

describe('utilisation-report-validator', () => {
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

        it('should return an error with an example filename when the filename contains an incorrect month', () => {
          // Arrange
          const incorrectMonth = allMonths.find((month) => month.index === index + 1)?.short ?? MONTH_NAMES.JANUARY.short;
          const filename = `Monthly Bank-${incorrectMonth}-${year}.xlsx`;

          const exampleFilenameReportPeriod = `${numeric}-${year}`;

          // Act
          const { filenameError } = validateFilenameFormat(filename, dueReportPeriod);

          // Assert
          expect(filenameError).toBe(`The selected file must contain the reporting period as part of its name, for example '${exampleFilenameReportPeriod}'`);
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

      it('should return an error with an example filename when the filename contains an incorrect month', () => {
        // Arrange
        const incorrectMonth = MONTH_NAMES.JANUARY.short;
        const filename = `Quarterly Bank-${incorrectMonth}-${year}.xlsx`;

        const exampleFilenameReportPeriod = `0${endMonth}-${year}`;

        // Act
        const { filenameError } = validateFilenameFormat(filename, dueQuarterlyReportPeriod);

        // Assert
        expect(filenameError).toBe(`The selected file must contain the reporting period as part of its name, for example '${exampleFilenameReportPeriod}'`);
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

      it('should return an error with an example filename when the filename contains an incorrect month', () => {
        // Arrange
        const incorrectMonth = MONTH_NAMES.JANUARY.short;
        const filename = `Quarterly Bank-${incorrectMonth}-${endYear}.xlsx`;

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
