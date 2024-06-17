import httpMocks from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import { when } from 'jest-when';
import { ApiError, FeeRecordEntityMockBuilder, UtilisationReportEntity, UtilisationReportEntityMockBuilder } from '@ukef/dtfs2-common';
import { postKeyingData } from '.';
import { UtilisationReportRepo } from '../../../../repositories/utilisation-reports-repo';

console.error = jest.fn();

class TestApiError extends ApiError {
  constructor(status?: number, message?: string) {
    super({ status: status ?? 500, message: message ?? '' });
  }
}

describe('post-keying-data.controller', () => {
  describe('postKeyingData', () => {
    const reportId = 12;

    const getHttpMocks = () =>
      httpMocks.createMocks({
        params: { reportId: reportId.toString() },
      });

    const findOneByIdWithFeeRecordsFilteredByStatusSpy = jest.spyOn(UtilisationReportRepo, 'findOneByIdWithFeeRecordsFilteredByStatus');

    beforeEach(() => {
      findOneByIdWithFeeRecordsFilteredByStatusSpy.mockResolvedValue(aUtilisationReportWithToDoFeeRecords());
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('responds with a 404 if a utilisation report with the supplied id cannot be found', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      when(findOneByIdWithFeeRecordsFilteredByStatusSpy).calledWith(reportId, ['MATCH']).mockResolvedValue(null);

      // Act
      await postKeyingData(req, res);

      // Assert
      expect(res._getStatusCode()).toBe(HttpStatusCode.NotFound);
      expect(res._isEndCalled()).toBe(true);
    });

    it("responds with a 400 if the report contains no fee records with the 'MATCH' status", async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      const reconciliationInProgressReport = UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_IN_PROGRESS').withId(reportId).build();
      reconciliationInProgressReport.feeRecords = [];

      when(findOneByIdWithFeeRecordsFilteredByStatusSpy).calledWith(reportId, ['MATCH']).mockResolvedValue(reconciliationInProgressReport);

      // Act
      await postKeyingData(req, res);

      // Assert
      expect(res._getStatusCode()).toBe(HttpStatusCode.BadRequest);
      expect(res._isEndCalled()).toBe(true);
    });

    it('responds with the 200 error code', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      const reconciliationInProgressReport = UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_IN_PROGRESS').withId(reportId).build();
      reconciliationInProgressReport.feeRecords = [FeeRecordEntityMockBuilder.forReport(reconciliationInProgressReport).withStatus('MATCH').build()];

      when(findOneByIdWithFeeRecordsFilteredByStatusSpy).calledWith(reportId, ['MATCH']).mockResolvedValue(reconciliationInProgressReport);

      // Act
      await postKeyingData(req, res);

      // Assert
      expect(res._getStatusCode()).toBe(HttpStatusCode.Ok);
    });

    it("responds with the specific error message if saving the report throws an 'ApiError'", async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      const errorMessage = 'Some error message';
      findOneByIdWithFeeRecordsFilteredByStatusSpy.mockRejectedValue(new TestApiError(undefined, errorMessage));

      // Act
      await postKeyingData(req, res);

      // Assert
      expect(res._getData()).toBe(`Failed to generate keying data: ${errorMessage}`);
    });

    it('responds with a 500 if an unknown error occurs', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      findOneByIdWithFeeRecordsFilteredByStatusSpy.mockRejectedValue(new Error('Some error'));

      // Act
      await postKeyingData(req, res);

      // Assert
      expect(res._getStatusCode()).toBe(HttpStatusCode.InternalServerError);
    });

    it('responds with a generic error message if an unknown error occurs', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      findOneByIdWithFeeRecordsFilteredByStatusSpy.mockRejectedValue(new Error('Some error'));

      // Act
      await postKeyingData(req, res);

      // Assert
      expect(res._getData()).toBe('Failed to generate keying data');
    });

    function aUtilisationReportWithToDoFeeRecords(): UtilisationReportEntity {
      const report = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build();
      const toDoFeeRecords = [
        FeeRecordEntityMockBuilder.forReport(report).withStatus('TO_DO').build(),
        FeeRecordEntityMockBuilder.forReport(report).withStatus('TO_DO').build(),
      ];
      report.feeRecords = toDoFeeRecords;
      return report;
    }
  });
});
