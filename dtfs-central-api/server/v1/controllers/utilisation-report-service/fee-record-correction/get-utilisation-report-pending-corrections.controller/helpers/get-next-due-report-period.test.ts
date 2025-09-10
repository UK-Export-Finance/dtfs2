import { UtilisationReportEntityMockBuilder } from '@ukef/dtfs2-common/test-helpers';
import { getNextReportPeriodForBankSchedule } from '@ukef/dtfs2-common';
import { UtilisationReportRepo } from '../../../../../../repositories/utilisation-reports-repo';
import { aBank } from '../../../../../../../test-helpers';
import { getNextDueReportPeriod } from './get-next-due-report-period';

jest.mock('../../../../../../repositories/utilisation-reports-repo');

describe('get-next-due-report-period', () => {
  describe('getNextDueReportPeriod', () => {
    const bank = aBank();

    beforeEach(() => {
      jest.resetAllMocks();
    });

    it('should call fetch due reports by bank id', async () => {
      // Arrange
      const findDueReportsByBankIdSpy = jest.spyOn(UtilisationReportRepo, 'findDueReportsByBankId').mockResolvedValue([]);

      // Act
      await getNextDueReportPeriod(bank);

      // Assert
      expect(findDueReportsByBankIdSpy).toHaveBeenCalledTimes(1);
      expect(findDueReportsByBankIdSpy).toHaveBeenCalledWith(bank.id);
    });

    describe('when there are no due reports', () => {
      beforeEach(() => {
        jest.spyOn(UtilisationReportRepo, 'findDueReportsByBankId').mockResolvedValue([]);
      });

      it('should return the next report period in the bank schedule if there are no due reports', async () => {
        // Act
        const result = await getNextDueReportPeriod(bank);

        // Assert
        expect(result).toEqual(getNextReportPeriodForBankSchedule(bank.utilisationReportPeriodSchedule));
      });
    });

    describe('when there are due reports', () => {
      const dueReports = [
        new UtilisationReportEntityMockBuilder().withReportPeriod({ start: { month: 12, year: 2023 }, end: { month: 2, year: 2024 } }).build(),
        new UtilisationReportEntityMockBuilder().withReportPeriod({ start: { month: 3, year: 2024 }, end: { month: 5, year: 2024 } }).build(),
      ];

      beforeEach(() => {
        jest.spyOn(UtilisationReportRepo, 'findDueReportsByBankId').mockResolvedValue(dueReports);
      });

      it('should return the report period for the first returned not received report', async () => {
        // Act
        const result = await getNextDueReportPeriod(bank);

        // Assert
        expect(result).toEqual(dueReports[0].reportPeriod);
      });
    });
  });
});
