import { when } from 'jest-when';
import { Not } from 'typeorm';
import { ReportPeriod, UtilisationReportEntity, UtilisationReportReconciliationStatus } from '@ukef/dtfs2-common';
import { UtilisationReportRepo } from './utilisation-report.repo';

describe('UtilisationReportRepo', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('findReportingYearsByBankId', () => {
    const findSpy = jest.spyOn(UtilisationReportRepo, 'find');

    const aUtilisationReportEntityWithOnlyReportPeriodSelected = (reportPeriod: ReportPeriod): UtilisationReportEntity =>
      ({ reportPeriod }) as UtilisationReportEntity;

    beforeEach(() => {
      findSpy.mockRejectedValue('Some error');
    });

    it('returns a set containing all the years where the report status is not REPORT_NOT_RECEIVED', async () => {
      // Arrange
      const bankId = '123';
      const reports = [
        aUtilisationReportEntityWithOnlyReportPeriodSelected({
          start: { month: 1, year: 2020 },
          end: { month: 1, year: 2021 },
        }),
        aUtilisationReportEntityWithOnlyReportPeriodSelected({
          start: { month: 1, year: 2023 },
          end: { month: 1, year: 2023 },
        }),
      ];

      when(findSpy)
        .calledWith({
          where: {
            bankId,
            status: Not<UtilisationReportReconciliationStatus>('REPORT_NOT_RECEIVED'),
          },
          select: ['reportPeriod'],
        })
        .mockResolvedValue(reports);

      // Act
      const result = await UtilisationReportRepo.findReportingYearsByBankId(bankId);

      // Assert
      expect(result).toEqual(new Set([2020, 2021, 2023]));
    });
  });
});
