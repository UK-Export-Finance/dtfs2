import { parseReportPeriod } from './helpers';

describe('get-utilisation-reports.controller helper', () => {
  describe('parseReportPeriod', () => {
    it('returns undefined if the input is undefined', () => {
      // Act
      const result = parseReportPeriod(undefined);

      // Assert
      expect(result).toBeUndefined();
    });

    it('throws an error if the input string is not a valid JSON string', () => {
      // Arrange
      const invalidJsonString = '';

      // Act/Assert
      expect(() => parseReportPeriod(invalidJsonString)).toThrow(SyntaxError);
    });

    it('throws an error if the parsed report period is not a valid report period', () => {
      // Arrange
      const invalidReportPeriod = {
        start: {},
        end: {},
      };
      const invalidReportPeriodJson = JSON.stringify(invalidReportPeriod);

      // Act/Assert
      expect(() => parseReportPeriod(invalidReportPeriodJson)).toThrow(new Error(`'${invalidReportPeriodJson}' is not a valid report period`));
    });

    it('returns the parsed report period if the report period is valid', () => {
      // Arrange
      const validReportPeriod = {
        start: { month: 1, year: 2024 },
        end: { month: 1, year: 2024 },
      };
      const validReportPeriodJson = JSON.stringify(validReportPeriod);

      // Act
      const parsedReportPeriod = parseReportPeriod(validReportPeriodJson);

      // Assert
      expect(parsedReportPeriod).toEqual(validReportPeriod);
    });
  });
});
