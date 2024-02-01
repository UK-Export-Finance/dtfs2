import { parseReportPeriod } from './helpers';

describe('get-utilisation-reports.controller helper', () => {
  describe('parseReportPeriod', () => {
    it('returns undefined if the input is undefined', () => {
      // Act
      const result = parseReportPeriod(undefined);

      // Assert
      expect(result).toBeUndefined();
    });

    it('returns undefined if the parsed report period is not a valid report period', () => {
      // Arrange
      const invalidReportPeriod = {
        start: {},
        end: {},
      };
      const invalidReportPeriodJson = JSON.stringify(invalidReportPeriod);

      // Act
      const result = parseReportPeriod(invalidReportPeriodJson);

      // Assert
      expect(result).toBeUndefined();
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
