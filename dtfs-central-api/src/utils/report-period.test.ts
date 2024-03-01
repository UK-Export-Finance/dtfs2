import { parseReportPeriod } from './report-period';

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
});
