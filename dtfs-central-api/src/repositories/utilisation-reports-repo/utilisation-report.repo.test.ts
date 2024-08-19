import { when } from 'jest-when';
import { Not } from 'typeorm';
import { UtilisationReportEntityMockBuilder, UtilisationReportReconciliationStatus } from '@ukef/dtfs2-common';
import { UtilisationReportRepo } from './utilisation-report.repo';

describe('UtilisationReportRepo', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('findReportingYearsByBankId', () => {
    const findSpy = jest.spyOn(UtilisationReportRepo, 'find');

    beforeEach(() => {
      findSpy.mockRejectedValue('Some error');
    });

    it('returns a set containing all the years where the report status is not REPORT_NOT_RECEIVED', async () => {
      // Arrange
      const bankId = '123';
      const reports = [
        UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_IN_PROGRESS')
          .withBankId(bankId)
          .withReportPeriod({
            start: { month: 1, year: 2020 },
            end: { month: 1, year: 2021 },
          })
          .build(),
        UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION')
          .withBankId(bankId)
          .withReportPeriod({
            start: { month: 1, year: 2023 },
            end: { month: 1, year: 2023 },
          })
          .build(),
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
