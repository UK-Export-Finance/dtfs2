import {
  FEE_RECORD_STATUS,
  FeeRecordCorrectionEntityMockBuilder,
  FeeRecordEntityMockBuilder,
  RECONCILIATION_IN_PROGRESS,
  UtilisationReportEntity,
  UtilisationReportEntityMockBuilder,
} from '@ukef/dtfs2-common';
import { UtilisationReportRepo } from '../../../../../../repositories/utilisation-reports-repo';
import { mapReportToPendingCorrectionsResponseBody } from '.';
import { aBank, aPortalUser } from '../../../../../../../test-helpers';
import { getUserById } from '../../../../../../repositories/users-repo';
import { mapFeeRecordsToPendingCorrections } from './map-fee-records-to-pending-corrections';
import { getNextDueReportPeriod } from './get-next-due-report-period';

jest.mock('../../../../../../repositories/users-repo');
jest.mock('../../../../../../repositories/utilisation-reports-repo');

describe('get-utilisation-report-pending-corrections.controller helpers', () => {
  describe('mapReportToPendingCorrectionsResponseBody', () => {
    let report: UtilisationReportEntity;

    beforeEach(() => {
      jest.resetAllMocks();
      jest.spyOn(UtilisationReportRepo, 'findDueReportsByBankId').mockResolvedValue([]);
    });

    describe('when the report has no uploaded by user id', () => {
      beforeEach(() => {
        report = UtilisationReportEntityMockBuilder.forStatus(RECONCILIATION_IN_PROGRESS)
          .withId(1)
          .withUploadedByUserId(null)
          .withDateUploaded(new Date())
          .build();
      });

      it('should throw an error', async () => {
        // Act & Assert
        await expect(mapReportToPendingCorrectionsResponseBody(report, aBank())).rejects.toThrow(
          new Error(`Report with id ${report.id} with pending corrections has not yet been uploaded.`),
        );
      });
    });

    describe('when the report has no date uploaded', () => {
      beforeEach(() => {
        report = UtilisationReportEntityMockBuilder.forStatus(RECONCILIATION_IN_PROGRESS)
          .withId(1)
          .withUploadedByUserId('abc123')
          .withDateUploaded(null)
          .build();
      });

      it('should throw an error', async () => {
        // Act & Assert
        await expect(mapReportToPendingCorrectionsResponseBody(report, aBank())).rejects.toThrow(
          new Error(`Report with id ${report.id} with pending corrections has not yet been uploaded.`),
        );
      });
    });

    describe('when the report has been uploaded', () => {
      beforeEach(() => {
        report = UtilisationReportEntityMockBuilder.forStatus(RECONCILIATION_IN_PROGRESS)
          .withId(1)
          .withReportPeriod({ start: { month: 1, year: 2021 }, end: { month: 3, year: 2021 } })
          .withUploadedByUserId('abc123')
          .withDateUploaded(new Date())
          .withFeeRecords([
            new FeeRecordEntityMockBuilder()
              .withStatus(FEE_RECORD_STATUS.PENDING_CORRECTION)
              .withCorrections([new FeeRecordCorrectionEntityMockBuilder().withIsCompleted(false).build()])
              .build(),
          ])
          .build();
      });

      describe('and when finding the user errors', () => {
        const mockError = new Error('Could not find user');

        beforeEach(() => {
          jest.mocked(getUserById).mockRejectedValue(mockError);
        });

        it('should rethrow the error', async () => {
          // Act & Assert
          await expect(mapReportToPendingCorrectionsResponseBody(report, aBank())).rejects.toThrow(mockError);
        });
      });

      describe('and when the user is found', () => {
        const user = { ...aPortalUser(), firstname: 'John', surname: 'Doe' };

        beforeEach(() => {
          jest.mocked(getUserById).mockResolvedValue(user);
        });

        it('should return the pending corrections response body', async () => {
          // Arrange
          const bank = aBank();

          // Act
          const result = await mapReportToPendingCorrectionsResponseBody(report, bank);

          // Assert
          expect(result).toEqual({
            reportPeriod: report.reportPeriod,
            uploadedByFullName: `${user.firstname} ${user.surname}`,
            dateUploaded: report.dateUploaded,
            corrections: mapFeeRecordsToPendingCorrections(report.feeRecords),
            nextDueReportPeriod: await getNextDueReportPeriod(bank),
          });
        });
      });
    });
  });
});
