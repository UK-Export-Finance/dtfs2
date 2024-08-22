import httpMocks from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import { ObjectId } from 'mongodb';
import { EntityManager } from 'typeorm';
import { ApiError, MOCK_AZURE_FILE_INFO, UtilisationReportEntityMockBuilder } from '@ukef/dtfs2-common';
import { postUploadUtilisationReport, postUploadUtilisationReportPayloadValidator, PostUploadUtilisationReportRequestBody } from '.';
import { executeWithSqlTransaction } from '../../../../helpers';
import { TransactionFailedError } from '../../../../errors';
import { UtilisationReportStateMachine } from '../../../../services/state-machines/utilisation-report/utilisation-report.state-machine';
import { aUtilisationReportRawCsvData } from '../../../../../test-helpers';

jest.mock('../../../../helpers');

console.error = jest.fn();

class TestApiError extends ApiError {
  constructor({ message, status }: { message: string; status: number }) {
    super({ message, status });
  }
}

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

  describe('postUploadUtilisationReportPayloadValidator', () => {
    const mockNext = jest.fn();

    beforeEach(() => {
      jest.resetAllMocks();
    });

    it('calls the next function when there are no validation errors', () => {
      // Arrange
      const { req, res } = getHttpMocks();

      // Act
      postUploadUtilisationReportPayloadValidator(req, res, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
      expect(res._isEndCalled()).toBe(false);
    });

    const propertyNamesWithInvalidValues = [
      {
        propertyName: 'reportId',
        value: '20',
      },
      {
        propertyName: 'fileInfo',
        value: {},
      },
      {
        propertyName: 'reportData',
        value: {},
      },
      {
        propertyName: 'user',
        value: 'abc123',
      },
    ] as const;

    it.each(propertyNamesWithInvalidValues)("responds with an error if the '$propertyName' property is invalid", ({ propertyName, value }) => {
      // Arrange
      const { req, res } = getHttpMocks({
        [propertyName]: value,
      });

      // Act
      postUploadUtilisationReportPayloadValidator(req, res, mockNext);

      // Assert
      expect(mockNext).not.toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(HttpStatusCode.BadRequest);
    });
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
      const testApiError = new TestApiError({
        message: errorMessage,
        status: errorStatus,
      });

      jest.mocked(executeWithSqlTransaction).mockRejectedValue(TransactionFailedError.forApiError(testApiError));

      // Act
      await postUploadUtilisationReport(req, res);

      // Assert
      expect(res._getStatusCode()).toBe(errorStatus);
      expect(res._getData()).toEqual(`Failed to save utilisation report: ${errorMessage}`);
    });

    describe('when the state transition is valid', () => {
      it('saves the report and responds with a success status code', async () => {
        // Arrange
        const { req, res } = getHttpMocks();

        const mockDate = new Date('2024-01-01');
        const updatedReport = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').withDateUploaded(mockDate).build();
        jest.mocked(mockEventHandler).mockResolvedValue(updatedReport);

        // Act
        await postUploadUtilisationReport(req, res);

        // Assert
        expect(mockEventHandler).toHaveBeenCalled();

        expect(res._getStatusCode()).toBe(HttpStatusCode.Created);
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
        expect(res._getStatusCode()).toBe(HttpStatusCode.InternalServerError);
      });
    });
  });
});
