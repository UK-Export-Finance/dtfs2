import httpMocks from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import { when } from 'jest-when';
import { EntityManager } from 'typeorm';
import { FeeRecordEntityMockBuilder, TestApiError, UtilisationReportEntity, UtilisationReportEntityMockBuilder } from '@ukef/dtfs2-common';
import { postKeyingData, PostKeyingDataRequest } from '.';
import { FeeRecordRepo } from '../../../../repositories/fee-record-repo';
import { executeWithSqlTransaction } from '../../../../helpers';
import { aTfmSessionUser } from '../../../../../test-helpers/test-data';
import { UtilisationReportStateMachine } from '../../../../services/state-machines/utilisation-report/utilisation-report.state-machine';

jest.mock('../../../../helpers');

console.error = jest.fn();

describe('post-keying-data.controller', () => {
  describe('postKeyingData', () => {
    const reportId = 12;

    const RECONCILIATION_IN_PROGRESS_REPORT = UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_IN_PROGRESS').withId(reportId).build();

    const getHttpMocks = () =>
      httpMocks.createMocks<PostKeyingDataRequest>({
        params: { reportId: reportId.toString() },
        body: { user: aTfmSessionUser() },
      });

    const someFeeRecordsForReport = (report: UtilisationReportEntity) => [
      FeeRecordEntityMockBuilder.forReport(report).withId(1).withStatus('MATCH').build(),
      FeeRecordEntityMockBuilder.forReport(report).withId(2).withStatus('MATCH').build(),
    ];

    const feeRecordRepoFindSpy = jest.spyOn(FeeRecordRepo, 'findByReportIdAndStatusesWithReportAndPayments');

    const utilisationReportStateMachineConstructorSpy = jest.spyOn(UtilisationReportStateMachine, 'forReport');

    const mockEventHandler = jest.fn();
    const mockUtilisationReportStateMachine = {
      handleEvent: mockEventHandler,
    } as unknown as UtilisationReportStateMachine;

    const mockEntityManager = {} as unknown as EntityManager;

    beforeEach(() => {
      feeRecordRepoFindSpy.mockResolvedValue([]);
      utilisationReportStateMachineConstructorSpy.mockReturnValue(mockUtilisationReportStateMachine);

      jest.mocked(executeWithSqlTransaction).mockImplementation(async (functionToExecute) => {
        await functionToExecute(mockEntityManager);
      });
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('responds with a 404 (Not Found) if no fee records matching the supplied criteria can be found', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      when(feeRecordRepoFindSpy).calledWith(reportId, ['MATCH']).mockResolvedValue([]);

      // Act
      await postKeyingData(req, res);

      // Assert
      expect(res._getStatusCode()).toBe(HttpStatusCode.NotFound);
      expect(res._isEndCalled()).toBe(true);
    });

    it('responds with a 500 (Internal Server Error) if the returned fee records have an undefined report', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      const feeRecords = someFeeRecordsForReport(UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_IN_PROGRESS').build());
      feeRecords.forEach((feeRecord) => {
        // @ts-expect-error We are setting the report to be undefined purposefully
        // eslint-disable-next-line no-param-reassign
        delete feeRecord.report;
      });
      when(feeRecordRepoFindSpy).calledWith(reportId, ['MATCH']).mockResolvedValue(feeRecords);

      // Act
      await postKeyingData(req, res);

      // Assert
      expect(res._getStatusCode()).toBe(HttpStatusCode.InternalServerError);
      expect(res._isEndCalled()).toBe(true);
    });

    it('responds with a 200 and generates the keying data', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      const userId = 'abc123';
      req.body.user._id = userId;

      const feeRecords = [
        FeeRecordEntityMockBuilder.forReport(RECONCILIATION_IN_PROGRESS_REPORT).withStatus('MATCH').build(),
        FeeRecordEntityMockBuilder.forReport(RECONCILIATION_IN_PROGRESS_REPORT).withStatus('MATCH').build(),
      ];

      when(feeRecordRepoFindSpy).calledWith(reportId, ['MATCH']).mockResolvedValue(feeRecords);

      // Act
      await postKeyingData(req, res);

      // Assert
      expect(res._getStatusCode()).toBe(HttpStatusCode.Ok);
      expect(res._isEndCalled()).toBe(true);
      expect(mockEventHandler).toHaveBeenCalledWith({
        type: 'GENERATE_KEYING_DATA',
        payload: {
          transactionEntityManager: mockEntityManager,
          feeRecordsAtMatchStatusWithPayments: feeRecords,
          requestSource: {
            platform: 'TFM',
            userId,
          },
        },
      });
    });

    it("responds with the specific error message if saving the report throws an 'ApiError'", async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      const errorMessage = 'Some error message';
      feeRecordRepoFindSpy.mockRejectedValue(new TestApiError(undefined, errorMessage));

      // Act
      await postKeyingData(req, res);

      // Assert
      expect(res._getData()).toBe(`Failed to generate keying data: ${errorMessage}`);
    });

    it('responds with a 500 if an unknown error occurs', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      feeRecordRepoFindSpy.mockRejectedValue(new Error('Some error'));

      // Act
      await postKeyingData(req, res);

      // Assert
      expect(res._getStatusCode()).toBe(HttpStatusCode.InternalServerError);
    });

    it('responds with a generic error message if an unknown error occurs', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      feeRecordRepoFindSpy.mockRejectedValue(new Error('Some error'));

      // Act
      await postKeyingData(req, res);

      // Assert
      expect(res._getData()).toBe('Failed to generate keying data');
    });
  });
});
