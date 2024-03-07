import httpMocks from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import { ObjectId } from 'mongodb';
import { MOCK_AZURE_FILE_INFO, UtilisationReportEntityMockBuilder } from '@ukef/dtfs2-common';
import {
  postUploadUtilisationReport,
  postUploadUtilisationReportPayloadValidator,
  PostUploadUtilisationReportRequest,
  PostUploadUtilisationReportRequest2,
} from '.';
import { MOCK_UTILISATION_REPORT_RAW_CSV_DATA } from '../../../../../api-tests/mocks/utilisation-reports/utilisation-report-raw-csv-data';
import { UtilisationReportRepo } from '../../../../repositories/utilisation-reports-repo';
import { UtilisationReportStateMachine } from '../../../../services/state-machines/utilisation-report/utilisation-report.state-machine';

console.error = jest.fn();

describe('post-upload-utilisation-report controller', () => {
  const validPostUploadUtilisationReportRequestBody: PostUploadUtilisationReportRequest['body'] = {
    reportId: 1,
    fileInfo: MOCK_AZURE_FILE_INFO,
    reportData: [MOCK_UTILISATION_REPORT_RAW_CSV_DATA],
    user: {
      _id: new ObjectId().toString(),
    },
  };

  const getHttpMocks = (options?: Partial<PostUploadUtilisationReportRequest2['body']>) =>
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

    beforeAll(() => {
      jest.useFakeTimers();
      jest.setSystemTime(mockDate);
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    beforeEach(() => {
      jest.resetAllMocks();
    });

    const mockNotReceivedUtilisationReportEntity = UtilisationReportEntityMockBuilder.forStatus('REPORT_NOT_RECEIVED').build();
    const mockUpdatedUtilisationReportEntity = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION')
      .withDateUploaded(mockDate)
      .withId(mockNotReceivedUtilisationReportEntity.id)
      .build();

    const mockStateMachine = UtilisationReportStateMachine.forReport(mockNotReceivedUtilisationReportEntity);

    it('calls the correct repo method and response with a success status code if the state transition is valid', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      const utilisationReportRepoSaveSpy = jest.spyOn(UtilisationReportRepo, 'save').mockResolvedValue(mockUpdatedUtilisationReportEntity);

      const createStateMachineForReportIdSpy = jest.spyOn(UtilisationReportStateMachine, 'forReportId').mockResolvedValue(mockStateMachine);

      // Act
      await postUploadUtilisationReport(req, res);

      // Assert
      expect(createStateMachineForReportIdSpy).toHaveBeenCalledWith(validPostUploadUtilisationReportRequestBody.reportId);
      expect(utilisationReportRepoSaveSpy).toHaveBeenCalledTimes(1);
      expect(res._getStatusCode()).toBe(HttpStatusCode.Created);
      expect(res._getData()).toEqual({ dateUploaded: mockDate });
    });

    it('responds with a specific error status code if the state transition is invalid', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      const utilisationReportRepoSaveSpy = jest.spyOn(UtilisationReportRepo, 'save');

      const mockInvalidStateMachine = UtilisationReportStateMachine.forReport(mockUpdatedUtilisationReportEntity);
      const createStateMachineForReportIdSpy = jest.spyOn(UtilisationReportStateMachine, 'forReportId').mockResolvedValue(mockInvalidStateMachine);

      // Act
      await postUploadUtilisationReport(req, res);

      // Assert
      expect(createStateMachineForReportIdSpy).toHaveBeenCalledWith(validPostUploadUtilisationReportRequestBody.reportId);
      expect(utilisationReportRepoSaveSpy).not.toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(HttpStatusCode.BadRequest);
      expect(res._getData()).toEqual(expect.stringContaining('Failed to save utilisation report:'));
    });

    it('responds with an internal server error if an unexpected error occurs', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      const utilisationReportRepoSaveSpy = jest.spyOn(UtilisationReportRepo, 'save').mockRejectedValue(new Error('Some error'));

      const createStateMachineForReportIdSpy = jest.spyOn(UtilisationReportStateMachine, 'forReportId').mockResolvedValue(mockStateMachine);

      // Act
      await postUploadUtilisationReport(req, res);

      // Assert
      expect(createStateMachineForReportIdSpy).toHaveBeenCalledWith(validPostUploadUtilisationReportRequestBody.reportId);
      expect(utilisationReportRepoSaveSpy).toHaveBeenCalledTimes(1);
      expect(res._getStatusCode()).toBe(HttpStatusCode.InternalServerError);
      expect(res._getData()).toEqual('Failed to save utilisation report');
    });
  });
});
