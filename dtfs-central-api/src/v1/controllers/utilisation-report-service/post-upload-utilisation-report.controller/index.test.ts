import httpMocks from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import { ObjectId } from 'mongodb';
import { MOCK_AZURE_FILE_INFO, UtilisationReportEntity, UtilisationReportEntityMockBuilder } from '@ukef/dtfs2-common';
import { postUploadUtilisationReport, postUploadUtilisationReportPayloadValidator, PostUploadUtilisationReportRequestBody } from '.';
import { MOCK_UTILISATION_REPORT_RAW_CSV_DATA } from '../../../../../api-tests/mocks/utilisation-reports/utilisation-report-raw-csv-data';
import { UtilisationReportRepo } from '../../../../repositories/utilisation-reports-repo';
import { UtilisationReportStateMachine } from '../../../../services/state-machines/utilisation-report/utilisation-report.state-machine';

console.error = jest.fn();

describe('post-upload-utilisation-report controller', () => {
  const validPostUploadUtilisationReportRequestBody: PostUploadUtilisationReportRequestBody = {
    reportId: 1,
    fileInfo: MOCK_AZURE_FILE_INFO,
    reportData: [MOCK_UTILISATION_REPORT_RAW_CSV_DATA],
    user: {
      _id: new ObjectId().toString(),
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

    const createMockReports = (): { notReceivedReport: UtilisationReportEntity; updatedReport: UtilisationReportEntity } => {
      const notReceivedReport = UtilisationReportEntityMockBuilder.forStatus('REPORT_NOT_RECEIVED').build();
      const updatedReport = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION')
        .withId(notReceivedReport.id)
        .withDateUploaded(mockDate)
        .build();
      return { notReceivedReport, updatedReport };
    };

    it('responds with a specific error status code if the state transition is invalid', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      const utilisationReportRepoSaveSpy = jest.spyOn(UtilisationReportRepo, 'save');

      const { updatedReport } = createMockReports();

      const mockInvalidStateMachine = UtilisationReportStateMachine.forReport(updatedReport);
      const createStateMachineForReportIdSpy = jest.spyOn(UtilisationReportStateMachine, 'forReportId').mockResolvedValue(mockInvalidStateMachine);

      // Act
      await postUploadUtilisationReport(req, res);

      // Assert
      expect(createStateMachineForReportIdSpy).toHaveBeenCalledWith(validPostUploadUtilisationReportRequestBody.reportId);
      expect(utilisationReportRepoSaveSpy).not.toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(HttpStatusCode.BadRequest);
      expect(res._getData()).toEqual(expect.stringContaining('Failed to save utilisation report:'));
    });

    describe('when the state transition is valid', () => {
      const createStateMachineForReportIdSpy = jest.spyOn(UtilisationReportStateMachine, 'forReportId');

      it('calls the correct repo method and responds with a success status code', async () => {
        // Arrange
        const { req, res } = getHttpMocks();

        const { notReceivedReport, updatedReport } = createMockReports();

        const mockStateMachine = UtilisationReportStateMachine.forReport(notReceivedReport);
        createStateMachineForReportIdSpy.mockResolvedValue(mockStateMachine);

        const utilisationReportRepoSaveSpy = jest.spyOn(UtilisationReportRepo, 'save').mockResolvedValue(updatedReport);

        // Act
        await postUploadUtilisationReport(req, res);

        // Assert
        expect(createStateMachineForReportIdSpy).toHaveBeenCalledWith(validPostUploadUtilisationReportRequestBody.reportId);
        expect(utilisationReportRepoSaveSpy).toHaveBeenCalledTimes(1);
        expect(res._getStatusCode()).toBe(HttpStatusCode.Created);
        expect(res._getData()).toEqual({ dateUploaded: mockDate });
      });

      it('responds with an internal server error if an unexpected error occurs', async () => {
        // Arrange
        const { req, res } = getHttpMocks();

        const { notReceivedReport } = createMockReports();

        const mockStateMachine = UtilisationReportStateMachine.forReport(notReceivedReport);
        createStateMachineForReportIdSpy.mockResolvedValue(mockStateMachine);

        const utilisationReportRepoSaveSpy = jest.spyOn(UtilisationReportRepo, 'save').mockRejectedValue(new Error('Some error'));

        // Act
        await postUploadUtilisationReport(req, res);

        // Assert
        expect(res._getData()).toEqual('Failed to save utilisation report');
        expect(createStateMachineForReportIdSpy).toHaveBeenCalledWith(validPostUploadUtilisationReportRequestBody.reportId);
        expect(utilisationReportRepoSaveSpy).toHaveBeenCalledTimes(1);
        expect(res._getStatusCode()).toBe(HttpStatusCode.InternalServerError);
      });
    });
  });
});
