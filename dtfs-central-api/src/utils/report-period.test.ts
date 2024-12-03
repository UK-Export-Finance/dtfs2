import { MonthAndYear } from '@ukef/dtfs2-common';
import { isValidReportPeriod, parseReportPeriod, validateReportPeriod } from './report-period';

describe('report-period utils', () => {
  describe('parseReportPeriod', () => {
    it('returns undefined if the input is undefined', () => {
      // Act
      const result = parseReportPeriod(undefined);

      // Assert
      expect(result).toBeUndefined();
    });

    const validMonthAndYearJsonObject = {
      month: '1',
      year: '2024',
    };

    it.each`
      condition                            | reportPeriodJsonObject
      ${"missing the 'start' field"}       | ${{ end: validMonthAndYearJsonObject }}
      ${"missing the 'start.month' field"} | ${{ end: validMonthAndYearJsonObject, start: { year: validMonthAndYearJsonObject.year } }}
      ${"missing the 'start.year' field"}  | ${{ end: validMonthAndYearJsonObject, start: { month: validMonthAndYearJsonObject.month } }}
      ${"missing the 'end' field"}         | ${{ start: validMonthAndYearJsonObject }}
      ${"missing the 'end.month' field"}   | ${{ start: validMonthAndYearJsonObject, end: { year: validMonthAndYearJsonObject.year } }}
      ${"missing the 'end.year' field"}    | ${{ start: validMonthAndYearJsonObject, end: { month: validMonthAndYearJsonObject.month } }}
    `('throws an error if the supplied json object is $condition', ({ reportPeriodJsonObject }: { reportPeriodJsonObject: object }) => {
      // Arrange
      const expectedError = new Error('Supplied report period json object did not match the expected format');

      // Act/Assert
      expect(() => parseReportPeriod(reportPeriodJsonObject)).toThrow(expectedError);
    });

    it.each`
      condition                                    | reportPeriodJsonObject
      ${"contains an invalid 'start.month' value"} | ${{ end: validMonthAndYearJsonObject, start: { year: validMonthAndYearJsonObject.year, month: 'January' } }}
      ${"contains an invalid 'start.year' value"}  | ${{ end: validMonthAndYearJsonObject, start: { month: validMonthAndYearJsonObject.month, year: '21st Century' } }}
      ${"contains an invalid 'end.month' value"}   | ${{ start: validMonthAndYearJsonObject, end: { year: validMonthAndYearJsonObject.year, month: 'January' } }}
      ${"contains an invalid 'end.year' value"}    | ${{ start: validMonthAndYearJsonObject, end: { month: validMonthAndYearJsonObject.month, year: '21st Century' } }}
    `('throws an error if the report period json object $condition', ({ reportPeriodJsonObject }: { reportPeriodJsonObject: object }) => {
      // Arrange
      const expectedError = new Error(`'${JSON.stringify(reportPeriodJsonObject)}' is not a valid report period`);

      // Act/Assert
      expect(() => parseReportPeriod(reportPeriodJsonObject)).toThrow(expectedError);
    });

    it('returns the parsed report period if the report period is valid', () => {
      // Arrange
      const validReportPeriod = {
        start: validMonthAndYearJsonObject,
        end: validMonthAndYearJsonObject,
      };

      // Act
      const parsedReportPeriod = parseReportPeriod(validReportPeriod);

      // Assert
      expect(parsedReportPeriod).toEqual({
        start: {
          month: Number(validReportPeriod.start.month),
          year: Number(validReportPeriod.start.year),
        },
        end: {
          month: Number(validReportPeriod.end.month),
          year: Number(validReportPeriod.end.year),
        },
      });
    });
  });

  describe('validateReportPeriod', () => {
    it('returns an empty array when correct report period is provided', () => {
      const validationErrors = validateReportPeriod({
        start: {
          month: 1,
          year: 2021,
        },
        end: {
          month: 1,
          year: 2021,
        },
      });

      expect(validationErrors).toEqual([]);
    });

    const validMonthAndYear: MonthAndYear = {
      month: 1,
      year: 2024,
    };

    it.each`
      condition                                           | invalidReportPeriod                                                    | errorMessage
      ${"'reportPeriod' is undefined"}                    | ${undefined}                                                           | ${"Report period is not valid: 'reportPeriod' must be an object"}
      ${"'reportPeriod' is null"}                         | ${null}                                                                | ${"Report period is not valid: 'reportPeriod' must be an object"}
      ${"'reportPeriod.start' is undefined"}              | ${{ start: undefined }}                                                | ${"Report period is not valid: 'reportPeriod.start' must be an object"}
      ${"'reportPeriod.start' is null"}                   | ${{ start: null }}                                                     | ${"Report period is not valid: 'reportPeriod.start' must be an object"}
      ${"'reportPeriod.end' is undefined"}                | ${{ start: { month: 1, year: 2024 }, end: undefined }}                 | ${"Report period is not valid: 'reportPeriod.end' must be an object"}
      ${"'reportPeriod.end' is null"}                     | ${{ start: { month: 1, year: 2024 }, end: null }}                      | ${"Report period is not valid: 'reportPeriod.end' must be an object"}
      ${"'reportPeriod.start.month' is undefined"}        | ${{ start: { month: undefined, year: 2024 }, end: validMonthAndYear }} | ${"Report period is not valid: 'reportPeriod.start.month' is required"}
      ${"'reportPeriod.start.month' is null"}             | ${{ start: { month: null, year: 2024 }, end: validMonthAndYear }}      | ${"Report period is not valid: 'reportPeriod.start.month' is required"}
      ${"'reportPeriod.start.month' is less than 1"}      | ${{ start: { month: 0, year: 2024 }, end: validMonthAndYear }}         | ${"Report period is not valid: 'reportPeriod.start.month' must be between 1 and 12"}
      ${"'reportPeriod.start.month' is greater than 12"}  | ${{ start: { month: 13, year: 2024 }, end: validMonthAndYear }}        | ${"Report period is not valid: 'reportPeriod.start.month' must be between 1 and 12"}
      ${"'reportPeriod.start.year' is undefined"}         | ${{ start: { month: 1, year: undefined }, end: validMonthAndYear }}    | ${"Report period is not valid: 'reportPeriod.start.year' is required"}
      ${"'reportPeriod.start.year' is null"}              | ${{ start: { month: 1, year: null }, end: validMonthAndYear }}         | ${"Report period is not valid: 'reportPeriod.start.year' is required"}
      ${"'reportPeriod.start.year' is less than 2020"}    | ${{ start: { month: 1, year: 2019 }, end: validMonthAndYear }}         | ${"Report period is not valid: 'reportPeriod.start.year' must be between 2020 and 2100"}
      ${"'reportPeriod.start.year' is greater than 2100"} | ${{ start: { month: 1, year: 2101 }, end: validMonthAndYear }}         | ${"Report period is not valid: 'reportPeriod.start.year' must be between 2020 and 2100"}
      ${"'reportPeriod.end.month' is undefined"}          | ${{ start: validMonthAndYear, end: { month: undefined, year: 2024 } }} | ${"Report period is not valid: 'reportPeriod.end.month' is required"}
      ${"'reportPeriod.end.month' is null"}               | ${{ start: validMonthAndYear, end: { month: null, year: 2024 } }}      | ${"Report period is not valid: 'reportPeriod.end.month' is required"}
      ${"'reportPeriod.end.month' is less than 1"}        | ${{ start: validMonthAndYear, end: { month: 0, year: 2024 } }}         | ${"Report period is not valid: 'reportPeriod.end.month' must be between 1 and 12"}
      ${"'reportPeriod.end.month' is greater than 12"}    | ${{ start: validMonthAndYear, end: { month: 13, year: 2024 } }}        | ${"Report period is not valid: 'reportPeriod.end.month' must be between 1 and 12"}
      ${"'reportPeriod.end.year' is undefined"}           | ${{ start: validMonthAndYear, end: { month: 1, year: undefined } }}    | ${"Report period is not valid: 'reportPeriod.end.year' is required"}
      ${"'reportPeriod.end.year' is null"}                | ${{ start: validMonthAndYear, end: { month: 1, year: null } }}         | ${"Report period is not valid: 'reportPeriod.end.year' is required"}
      ${"'reportPeriod.end.year' is less than 2020"}      | ${{ start: validMonthAndYear, end: { month: 1, year: 2019 } }}         | ${"Report period is not valid: 'reportPeriod.end.year' must be between 2020 and 2100"}
      ${"'reportPeriod.end.year' is greater than 2100"}   | ${{ start: validMonthAndYear, end: { month: 1, year: 2101 } }}         | ${"Report period is not valid: 'reportPeriod.end.year' must be between 2020 and 2100"}
    `('returns an error when $condition', ({ invalidReportPeriod, errorMessage }) => {
      // Act
      const validationErrors = validateReportPeriod(invalidReportPeriod);

      // Assert
      expect(validationErrors).toEqual(expect.arrayContaining([errorMessage]));
    });
  });

  describe('isValidReportPeriod', () => {
    it('returns true when a correct report period is provided', () => {
      // Arrange
      const validReportPeriod = {
        start: {
          month: 1,
          year: 2021,
        },
        end: {
          month: 1,
          year: 2021,
        },
      };

      // Act
      const result = isValidReportPeriod(validReportPeriod);

      // Assert
      expect(result).toEqual(true);
    });

    const validStart = { month: 1, year: 2021 };
    const validEnd = { month: 1, year: 2021 };

    it.each`
      condition                                  | reportPeriod
      ${'is null'}                               | ${null}
      ${'is undefined'}                          | ${undefined}
      ${'is an empty object'}                    | ${{}}
      ${"is missing the 'start' property"}       | ${{ end: validEnd }}
      ${"is missing the 'start.month' property"} | ${{ start: { year: 2021 }, end: validEnd }}
      ${"is missing the 'start.year' property"}  | ${{ start: { month: 1 }, end: validEnd }}
      ${"is missing the 'end' property"}         | ${{ start: validStart }}
      ${"is missing the 'end.month' property"}   | ${{ start: validStart, end: { year: 2021 } }}
      ${"is missing the 'end.year' property"}    | ${{ start: validStart, end: { month: 1 } }}
    `('returns false when the reportPeriod object $condition', ({ reportPeriod }) => {
      // Act
      const result = isValidReportPeriod(reportPeriod);

      // Assert
      expect(result).toEqual(false);
    });
  });
});
