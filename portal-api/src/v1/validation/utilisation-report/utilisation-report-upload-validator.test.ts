import { UTILISATION_REPORT_RECONCILIATION_STATUS, UtilisationReportReconciliationStatus } from '@ukef/dtfs2-common';
import { InvalidReportStatusError } from '../../errors';
import { aReportPeriod } from '../../../../test-helpers/test-data/report-period';
import { getUtilisationReports } from '../../api';
import { validateReportForPeriodIsInReportNotReceivedStateAndReturnId } from './utilisation-report-upload-validator';
import { aNotReceivedUtilisationReportResponse, aUtilisationReportResponse } from '../../../../test-helpers/test-data/utilisation-report';

jest.mock('../../api');

describe('utilisation report upload validator', () => {
  describe('validateReportForPeriodIsInReportNotReceivedStateAndReturnId', () => {
    it('throws InvalidReportStatusError if there are no reports for period', async () => {
      // Arrange
      const bankId = '123';
      const reportPeriod = aReportPeriod();
      jest.mocked(getUtilisationReports).mockResolvedValue([]);

      // Act + Assert
      await expect(validateReportForPeriodIsInReportNotReceivedStateAndReturnId(bankId, reportPeriod)).rejects.toThrow(InvalidReportStatusError);
      expect(getUtilisationReports).toHaveBeenLastCalledWith(bankId, { reportPeriod });
    });

    it('throws InvalidReportStatusError if there is more than one report for period', async () => {
      // Arrange
      const bankId = '123';
      const reportPeriod = aReportPeriod();
      jest.mocked(getUtilisationReports).mockResolvedValue([aUtilisationReportResponse(), aUtilisationReportResponse()]);

      // Act + Assert
      await expect(validateReportForPeriodIsInReportNotReceivedStateAndReturnId(bankId, reportPeriod)).rejects.toThrow(InvalidReportStatusError);
      expect(getUtilisationReports).toHaveBeenLastCalledWith(bankId, { reportPeriod });
    });

    it.each(Object.values(UTILISATION_REPORT_RECONCILIATION_STATUS).filter((status) => status !== 'REPORT_NOT_RECEIVED'))(
      'throws InvalidReportStatusError if report has status %s',
      async (status: UtilisationReportReconciliationStatus) => {
        // Arrange
        const bankId = '123';
        const reportPeriod = aReportPeriod();
        jest.mocked(getUtilisationReports).mockResolvedValue([{ ...aUtilisationReportResponse(), status }]);

        // Act + Assert
        await expect(validateReportForPeriodIsInReportNotReceivedStateAndReturnId(bankId, reportPeriod)).rejects.toThrow(InvalidReportStatusError);
        expect(getUtilisationReports).toHaveBeenLastCalledWith(bankId, { reportPeriod });
      },
    );

    it('returns report id if report has REPORT_NOT_RECEIVED status', async () => {
      // Arrange
      const bankId = '123';
      const reportPeriod = aReportPeriod();
      const reportId = 21;
      jest.mocked(getUtilisationReports).mockResolvedValue([{ ...aNotReceivedUtilisationReportResponse(), status: 'REPORT_NOT_RECEIVED', id: reportId }]);

      // Act
      const result = await validateReportForPeriodIsInReportNotReceivedStateAndReturnId(bankId, reportPeriod);

      // Assert
      expect(result).toEqual(reportId);
      expect(getUtilisationReports).toHaveBeenLastCalledWith(bankId, { reportPeriod });
    });
  });
});
