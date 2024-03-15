import { validateUtilisationReportPeriodSchedule } from './utilisation-report-period-schedule-validator';

describe('utilisation-report-period-schedule-validator', () => {
  describe('validateUtilisationReportPeriodSchedule', () => {
    it("returns a validation error as a string when 'utilisationReportPeriodSchedule' is undefined", () => {
      const utilisationReportPeriodSchedule = undefined;
      const response = validateUtilisationReportPeriodSchedule(utilisationReportPeriodSchedule);

      expect(response).toEqual('Utilisation Report Period Schedule is missing or the incorrect format');
    });

    it.each([null, 123, {}, true, '123'])(
      "returns a validation error as a string when 'utilisationReportPeriodSchedule' is not an array",
      (utilisationReportPeriodSchedule) => {
        const response = validateUtilisationReportPeriodSchedule(utilisationReportPeriodSchedule);

        expect(response).toEqual('Utilisation Report Period Schedule is missing or the incorrect format');
      },
    );

    it("returns a validation error as a string when 'utilisationReportPeriodSchedule' does not have start month on all elements", () => {
      const utilisationReportPeriodSchedule = [
        {
          endMonth: 1,
        },
      ];
      const response = validateUtilisationReportPeriodSchedule(utilisationReportPeriodSchedule);

      expect(response).toEqual('Utilisation Report Period Schedule does not have start or end month');
    });

    it("returns a validation error as a string when first element of 'utilisationReportPeriodSchedule' does not start from January or a period spanning 2 years", () => {
      const utilisationReportPeriodSchedule = [
        {
          startMonth: 2,
          endMonth: 2,
        },
      ];
      const response = validateUtilisationReportPeriodSchedule(utilisationReportPeriodSchedule);

      expect(response).toEqual('Utilisation Report Period Schedule does not start from January or period which spans 2 years');
    });

    it('returns a validation error as a string when there are duplicated months in a monthly report period schedule', () => {
      const utilisationReportPeriodSchedule = [
        {
          startMonth: 1,
          endMonth: 1,
        },
        {
          startMonth: 1,
          endMonth: 1,
        },
      ];
      const response = validateUtilisationReportPeriodSchedule(utilisationReportPeriodSchedule);

      expect(response).toEqual('Utilisation Report Period Schedule contains duplicated months');
    });

    it('returns a validation error as a string when there are duplicated months in a quarterly report period schedule', () => {
      const utilisationReportPeriodSchedule = [
        {
          startMonth: 12,
          endMonth: 2,
        },
        {
          startMonth: 2,
          endMonth: 4,
        },
      ];
      const response = validateUtilisationReportPeriodSchedule(utilisationReportPeriodSchedule);

      expect(response).toEqual('Utilisation Report Period Schedule contains duplicated months');
    });

    it('returns a validation error as a string when there are more than 12 month values in a report period schedule', () => {
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
      const response = validateUtilisationReportPeriodSchedule(utilisationReportPeriodSchedule);

      expect(response).toEqual('Utilisation Report Period Schedule does not contain 12 months');
    });

    it('returns a validation error as a string when there are fewer than 12 month values in a report period schedule', () => {
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
      const response = validateUtilisationReportPeriodSchedule(utilisationReportPeriodSchedule);

      expect(response).toEqual('Utilisation Report Period Schedule does not contain 12 months');
    });

    it('returns a validation error as a string when the months in a monthly report period schedule are not in order', () => {
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
      const response = validateUtilisationReportPeriodSchedule(utilisationReportPeriodSchedule);

      expect(response).toEqual('Utilisation Report Period Schedule is not in correct order');
    });

    it('returns a validation error as a string when the months in a quarterly report period schedule are not in order', () => {
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
      const response = validateUtilisationReportPeriodSchedule(utilisationReportPeriodSchedule);

      expect(response).toEqual('Utilisation Report Period Schedule is not in correct order');
    });

    it('returns undefined (no error) when the monthly schedule is valid', () => {
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
      const response = validateUtilisationReportPeriodSchedule(utilisationReportPeriodSchedule);

      expect(response).toEqual(undefined);
    });

    it('returns undefined (no error) when the quarterly schedule is valid', () => {
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
      const response = validateUtilisationReportPeriodSchedule(utilisationReportPeriodSchedule);

      expect(response).toEqual(undefined);
    });
  });
});
