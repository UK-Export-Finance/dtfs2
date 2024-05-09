import { InvalidReportPeriodScheduleError } from '../../errors/invalid-report-period-schedule';
import { validateUtilisationReportPeriodSchedule } from './utilisation-report-period-schedule-validator';

describe('utilisation-report-period-schedule-validator', () => {
  describe('validateUtilisationReportPeriodSchedule', () => {
    it("throws an invalid report period schedule error when 'utilisationReportPeriodSchedule' is undefined", () => {
      // Arrange
      const utilisationReportPeriodSchedule = undefined;

      // Act + Assert
      expect(() => validateUtilisationReportPeriodSchedule(utilisationReportPeriodSchedule)).toThrow(
        new InvalidReportPeriodScheduleError('Utilisation report period schedule is missing or the incorrect format'),
      );
    });

    it.each([null, 123, {}, true, '123'])(
      "throws an invalid report period schedule error when 'utilisationReportPeriodSchedule' is not an array",
      (utilisationReportPeriodSchedule) => {
        // Act + Assert
        expect(() => validateUtilisationReportPeriodSchedule(utilisationReportPeriodSchedule)).toThrow(
          new InvalidReportPeriodScheduleError('Utilisation report period schedule is missing or the incorrect format'),
        );
      },
    );

    it("throws an invalid report period schedule error when 'utilisationReportPeriodSchedule' does not have start month on all elements", () => {
      // Arrange
      const utilisationReportPeriodSchedule = [
        {
          endMonth: 1,
        },
      ];

      // Act + Assert
      expect(() => validateUtilisationReportPeriodSchedule(utilisationReportPeriodSchedule)).toThrow(
        new InvalidReportPeriodScheduleError('Utilisation report period schedule is not in the correct format'),
      );
    });

    it("throws an invalid report period schedule error when 'utilisationReportPeriodSchedule' does not have end month on all elements", () => {
      // Arrange
      const utilisationReportPeriodSchedule = [
        {
          startMonth: 1,
        },
      ];

      // Act + Assert
      expect(() => validateUtilisationReportPeriodSchedule(utilisationReportPeriodSchedule)).toThrow(
        new InvalidReportPeriodScheduleError('Utilisation report period schedule is not in the correct format'),
      );
    });

    it("throws an invalid report period schedule error when first element of 'utilisationReportPeriodSchedule' does not start from January or a period spanning 2 years", () => {
      // Arrange
      const utilisationReportPeriodSchedule = [
        {
          startMonth: 2,
          endMonth: 2,
        },
      ];

      // Act + Assert
      expect(() => validateUtilisationReportPeriodSchedule(utilisationReportPeriodSchedule)).toThrow(
        new InvalidReportPeriodScheduleError('Utilisation report period schedule does not start from January or period which spans 2 years'),
      );
    });

    it('throws an invalid report period schedule error when there are duplicated months in a monthly report period schedule', () => {
      // Arrange
      const utilisationReportPeriodSchedule = [
        {
          startMonth: 1,
          endMonth: 1,
        },
        {
          startMonth: 1,
          endMonth: 1,
        },
        {
          startMonth: 2,
          endMonth: 2,
        },
        {
          startMonth: 3,
          endMonth: 3,
        },
        {
          startMonth: 4,
          endMonth: 4,
        },
        {
          startMonth: 5,
          endMonth: 5,
        },
        {
          startMonth: 6,
          endMonth: 6,
        },
        {
          startMonth: 7,
          endMonth: 7,
        },
        {
          startMonth: 8,
          endMonth: 8,
        },
        {
          startMonth: 9,
          endMonth: 9,
        },
        {
          startMonth: 10,
          endMonth: 10,
        },
        {
          startMonth: 11,
          endMonth: 11,
        },
      ];

      // Act + Assert
      expect(() => validateUtilisationReportPeriodSchedule(utilisationReportPeriodSchedule)).toThrow(
        new InvalidReportPeriodScheduleError('Utilisation report period schedule contains duplicated months'),
      );
    });

    it('throws an invalid report period schedule error when there are duplicated months in a quarterly report period schedule', () => {
      const utilisationReportPeriodSchedule = [
        {
          startMonth: 12,
          endMonth: 2,
        },
        {
          startMonth: 2,
          endMonth: 4,
        },
        {
          startMonth: 4,
          endMonth: 6,
        },
        {
          startMonth: 6,
          endMonth: 8,
        },
      ];

      // Act + Assert
      expect(() => validateUtilisationReportPeriodSchedule(utilisationReportPeriodSchedule)).toThrow(
        new InvalidReportPeriodScheduleError('Utilisation report period schedule contains duplicated months'),
      );
    });

    it('throws an invalid report period schedule error when there are more than 12 month values in a report period schedule', () => {
      // Arrange
      const utilisationReportPeriodSchedule = [
        {
          startMonth: 1,
          endMonth: 3,
        },
        {
          startMonth: 4,
          endMonth: 13,
        },
      ];

      // Act + Assert
      expect(() => validateUtilisationReportPeriodSchedule(utilisationReportPeriodSchedule)).toThrow(
        new InvalidReportPeriodScheduleError('Utilisation report period schedule does not contain 12 months'),
      );
    });

    it('throws an invalid report period schedule error when there are fewer than 12 month values in a report period schedule', () => {
      // Arrange
      const utilisationReportPeriodSchedule = [
        {
          startMonth: 1,
          endMonth: 1,
        },
        {
          startMonth: 2,
          endMonth: 2,
        },
      ];

      // Act + Assert
      expect(() => validateUtilisationReportPeriodSchedule(utilisationReportPeriodSchedule)).toThrow(
        new InvalidReportPeriodScheduleError('Utilisation report period schedule does not contain 12 months'),
      );
    });

    it('throws an invalid report period schedule error when the months in a monthly report period schedule are not in order', () => {
      // Arrange
      const utilisationReportPeriodSchedule = [
        {
          startMonth: 1,
          endMonth: 1,
        },
        {
          startMonth: 2,
          endMonth: 2,
        },
        {
          startMonth: 3,
          endMonth: 3,
        },
        {
          startMonth: 5,
          endMonth: 5,
        },
        {
          startMonth: 4,
          endMonth: 4,
        },
        {
          startMonth: 6,
          endMonth: 6,
        },
        {
          startMonth: 7,
          endMonth: 7,
        },
        {
          startMonth: 8,
          endMonth: 8,
        },
        {
          startMonth: 9,
          endMonth: 9,
        },
        {
          startMonth: 10,
          endMonth: 10,
        },
        {
          startMonth: 11,
          endMonth: 11,
        },
        {
          startMonth: 12,
          endMonth: 12,
        },
      ];

      // Act + Assert
      expect(() => validateUtilisationReportPeriodSchedule(utilisationReportPeriodSchedule)).toThrow(
        new InvalidReportPeriodScheduleError('Utilisation report period schedule is not in correct order'),
      );
    });

    it('throws an invalid report period schedule error when the months in a quarterly report period schedule are not in order', () => {
      // Arrange
      const utilisationReportPeriodSchedule = [
        {
          startMonth: 12,
          endMonth: 2,
        },
        {
          startMonth: 6,
          endMonth: 8,
        },
        {
          startMonth: 3,
          endMonth: 5,
        },
        {
          startMonth: 9,
          endMonth: 11,
        },
      ];

      // Act + Assert
      expect(() => validateUtilisationReportPeriodSchedule(utilisationReportPeriodSchedule)).toThrow(
        new InvalidReportPeriodScheduleError('Utilisation report period schedule is not in correct order'),
      );
    });

    it('returns undefined (no error) when the monthly schedule is valid', () => {
      // Arrange
      const utilisationReportPeriodSchedule = [
        {
          startMonth: 1,
          endMonth: 1,
        },
        {
          startMonth: 2,
          endMonth: 2,
        },
        {
          startMonth: 3,
          endMonth: 3,
        },
        {
          startMonth: 4,
          endMonth: 4,
        },
        {
          startMonth: 5,
          endMonth: 5,
        },
        {
          startMonth: 6,
          endMonth: 6,
        },
        {
          startMonth: 7,
          endMonth: 7,
        },
        {
          startMonth: 8,
          endMonth: 8,
        },
        {
          startMonth: 9,
          endMonth: 9,
        },
        {
          startMonth: 10,
          endMonth: 10,
        },
        {
          startMonth: 11,
          endMonth: 11,
        },
        {
          startMonth: 12,
          endMonth: 12,
        },
      ];

      // Act
      const response = validateUtilisationReportPeriodSchedule(utilisationReportPeriodSchedule);

      // Assert
      expect(response).toEqual(undefined);
    });

    it('returns undefined (no error) when the quarterly schedule is valid', () => {
      // Arrange
      const utilisationReportPeriodSchedule = [
        {
          startMonth: 12,
          endMonth: 2,
        },
        {
          startMonth: 3,
          endMonth: 5,
        },
        {
          startMonth: 6,
          endMonth: 8,
        },
        {
          startMonth: 9,
          endMonth: 11,
        },
      ];

      // Act
      const response = validateUtilisationReportPeriodSchedule(utilisationReportPeriodSchedule);

      // Assert
      expect(response).toEqual(undefined);
    });
  });
});
