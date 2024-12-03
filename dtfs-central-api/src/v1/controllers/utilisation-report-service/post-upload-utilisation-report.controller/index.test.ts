import httpMocks from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import { ObjectId } from 'mongodb';
import { EntityManager } from 'typeorm';
import { MOCK_AZURE_FILE_INFO, PENDING_RECONCILIATION, TestApiError, UtilisationReportEntityMockBuilder } from '@ukef/dtfs2-common';
import { postUploadUtilisationReport, PostUploadUtilisationReportRequestBody } from '.';
import { executeWithSqlTransaction } from '../../../../helpers';
import { TransactionFailedError } from '../../../../errors';
import { UtilisationReportStateMachine } from '../../../../services/state-machines/utilisation-report/utilisation-report.state-machine';
import { aUtilisationReportRawCsvData } from '../../../../../test-helpers';

jest.mock('../../../../helpers');

console.error = jest.fn();

describe('post-upload-utilisation-report controller', () => {
  const userId = new ObjectId().toString();
  const reportData = [aUtilisationReportRawCsvData()];

  const validPostUploadUtilisationReportRequestBody: PostUploadUtilisationReportRequestBody = {
    reportId: 1,
    fileInfo: MOCK_AZURE_FILE_INFO,
    reportData,
    user: {
      _id: userId,
    },
  };

  const getHttpMocks = (options?: Partial<PostUploadUtilisationReportRequestBody>) =>
    httpMocks.createMocks({
      body: {
        reportId: options?.reportId ?? validPostUploadUtilisationReportRequestBody.reportId,
        fileInfo: options?.fileInfo ?? validPostUploadUtilisationReportRequestBody.fileInfo,
        reportData: options?.reportData ?? validPostUploadUtilisationReportRequestBody.reportData,
        user: options?.user ?? validPostUploadUtilisationReportRequestBody.user,
      },
    });

  describe('postUploadUtilisationReport', () => {
    const mockEntityManager = {
      save: jest.fn(),
    } as unknown as EntityManager;

    const utilisationReportStateMachineConstructorSpy = jest.spyOn(UtilisationReportStateMachine, 'forReportId');

    const mockEventHandler = jest.fn();
    const mockUtilisationReportStateMachine = {
      handleEvent: mockEventHandler,
    } as unknown as UtilisationReportStateMachine;

    beforeEach(() => {
      utilisationReportStateMachineConstructorSpy.mockResolvedValue(mockUtilisationReportStateMachine);
      jest.mocked(executeWithSqlTransaction).mockImplementation(async (functionToExecute) => await functionToExecute(mockEntityManager));
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('responds with an specific status code if the transaction throws a specific error', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      const errorMessage = 'An error message';
      const errorStatus = HttpStatusCode.BadRequest;
      const testApiError = new TestApiError(errorStatus, errorMessage);

      jest.mocked(executeWithSqlTransaction).mockRejectedValue(TransactionFailedError.forApiError(testApiError));

      // Act
      await postUploadUtilisationReport(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(errorStatus);
      expect(res._getData()).toEqual(`Failed to save utilisation report: ${errorMessage}`);
    });

    describe('when the state transition is valid', () => {
      it('saves the report and responds with a success status code', async () => {
        // Arrange
        const { req, res } = getHttpMocks();

        const mockDate = new Date('2024-01-01');
        const updatedReport = UtilisationReportEntityMockBuilder.forStatus(PENDING_RECONCILIATION).withDateUploaded(mockDate).build();
        jest.mocked(mockEventHandler).mockResolvedValue(updatedReport);

        // Act
        await postUploadUtilisationReport(req, res);

        // Assert
        expect(mockEventHandler).toHaveBeenCalled();

        expect(res._getStatusCode()).toEqual(HttpStatusCode.Created);
        expect(res._getData()).toEqual({ dateUploaded: mockDate });
      });

      it('responds with an internal server error if an unexpected error occurs during the transaction', async () => {
        // Arrange
        const { req, res } = getHttpMocks();

        jest.mocked(executeWithSqlTransaction).mockRejectedValue(TransactionFailedError.forUnknownError());

        // Act
        await postUploadUtilisationReport(req, res);

        // Assert
        expect(res._getData()).toEqual(expect.stringContaining('Failed to save utilisation report'));
        expect(res._getStatusCode()).toEqual(HttpStatusCode.InternalServerError);
      });
    });
  });
});
