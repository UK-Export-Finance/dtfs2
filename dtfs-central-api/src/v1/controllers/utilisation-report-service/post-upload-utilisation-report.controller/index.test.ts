import httpMocks from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import { ObjectId } from 'mongodb';
import { EntityManager } from 'typeorm';
import { ApiError, MOCK_AZURE_FILE_INFO, UtilisationReportEntityMockBuilder } from '@ukef/dtfs2-common';
import { postUploadUtilisationReport, postUploadUtilisationReportPayloadValidator, PostUploadUtilisationReportRequestBody } from '.';
import { MOCK_UTILISATION_REPORT_RAW_CSV_DATA } from '../../../../../api-tests/mocks/utilisation-reports/utilisation-report-raw-csv-data';
import { UtilisationReportRepo } from '../../../../repositories/utilisation-reports-repo';
import { executeWithSqlTransaction } from '../../../../helpers';
import { TransactionFailedError } from '../../../../errors';

jest.mock('../../../../helpers');

console.error = jest.fn();

class TestApiError extends ApiError {
  constructor({ message, status }: { message: string; status: number }) {
    super({ message, status });
  }
}

describe('post-upload-utilisation-report controller', () => {
  const userId = new ObjectId().toString();
  const reportData = [MOCK_UTILISATION_REPORT_RAW_CSV_DATA];

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
    const mockDate = new Date('2024-01');

    const utilisationReportRepoFindOneBySpy = jest.spyOn(UtilisationReportRepo, 'findOneBy');

    const getNotReceivedReport = () => UtilisationReportEntityMockBuilder.forStatus('REPORT_NOT_RECEIVED').build();

    const mockSave = jest.fn();

    const mockEntityManager = {
      save: mockSave,
    } as unknown as EntityManager;

    beforeAll(() => {
      jest.useFakeTimers();
      jest.setSystemTime(mockDate);
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    beforeEach(() => {
      jest.resetAllMocks();

      jest.mocked(executeWithSqlTransaction).mockImplementation(async (functionToExecute) => await functionToExecute(mockEntityManager));
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('responds with an specific status code if the transaction throws a specific error', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      const invalidStatusReport = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build();
      utilisationReportRepoFindOneBySpy.mockResolvedValue(invalidStatusReport);

      const errorMessage = 'An error message';
      const errorStatus = HttpStatusCode.BadRequest;
      const testApiError = new TestApiError({
        message: errorMessage,
        status: errorStatus,
      });

      jest.mocked(executeWithSqlTransaction).mockRejectedValue(new TransactionFailedError(testApiError));

      // Act
      await postUploadUtilisationReport(req, res);

      // Assert
      expect(utilisationReportRepoFindOneBySpy).toHaveBeenCalledWith({
        id: validPostUploadUtilisationReportRequestBody.reportId,
      });
      expect(res._getStatusCode()).toBe(errorStatus);
      expect(res._getData()).toEqual(`Failed to save utilisation report: ${errorMessage}`);
    });

    describe('when the state transition is valid', () => {
      it('saves the report and responds with a success status code', async () => {
        // Arrange
        const { req, res } = getHttpMocks();

        const notReceivedReport = getNotReceivedReport();

        utilisationReportRepoFindOneBySpy.mockResolvedValue(notReceivedReport);

        jest.mocked(mockSave).mockResolvedValue(notReceivedReport);

        // Act
        await postUploadUtilisationReport(req, res);

        // Assert
        expect(utilisationReportRepoFindOneBySpy).toHaveBeenCalledWith({
          id: validPostUploadUtilisationReportRequestBody.reportId,
        });
        expect(mockSave).toHaveBeenCalled();

        expect(res._getStatusCode()).toBe(HttpStatusCode.Created);
        expect(res._getData()).toEqual({ dateUploaded: mockDate });
      });

      it('responds with an internal server error if an unexpected error occurs during the transaction', async () => {
        // Arrange
        const { req, res } = getHttpMocks();

        const notReceivedReport = getNotReceivedReport();
        utilisationReportRepoFindOneBySpy.mockResolvedValue(notReceivedReport);

        jest.mocked(executeWithSqlTransaction).mockRejectedValue(new TransactionFailedError());

        // Act
        await postUploadUtilisationReport(req, res);

        // Assert
        expect(res._getData()).toEqual(expect.stringContaining('Failed to save utilisation report'));
        expect(utilisationReportRepoFindOneBySpy).toHaveBeenCalledWith({
          id: validPostUploadUtilisationReportRequestBody.reportId,
        });
        expect(res._getStatusCode()).toBe(HttpStatusCode.InternalServerError);
      });
    });
  });
});
