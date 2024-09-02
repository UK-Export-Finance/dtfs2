import { MOCK_AZURE_FILE_INFO, Unknown } from '@ukef/dtfs2-common';
import httpMocks from 'node-mocks-http';
import { ObjectId } from 'mongodb';
import { HttpStatusCode } from 'axios';
import { aUtilisationReportRawCsvData } from '../../../../../test-helpers/test-data';
import { validatePostUploadUtilisationReportPayload } from './validate-post-upload-utilisation-report-payload';
import { PostUploadUtilisationReportRequestBody } from '../../../controllers/utilisation-report-service/post-upload-utilisation-report.controller';
import { validateUtilisationReportCsvData } from '../../../../services/utilisation-report-data-validator';

jest.mock('../../../../services/utilisation-report-data-validator');

describe('validate-post-upload-utilisation-report-payload', () => {
  describe('postUploadUtilisationReportPayloadValidator', () => {
    const mockNext = jest.fn();

    beforeEach(() => {
      jest.mocked(validateUtilisationReportCsvData).mockReturnValue([]);
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    const userId = new ObjectId().toString();
    const reportData = [aUtilisationReportRawCsvData()];
    const aValidPayload: PostUploadUtilisationReportRequestBody = {
      reportId: 1,
      fileInfo: MOCK_AZURE_FILE_INFO,
      reportData,
      user: {
        _id: userId,
      },
    };

    const getHttpMocks = (options?: Partial<Unknown<PostUploadUtilisationReportRequestBody>>) =>
      httpMocks.createMocks({
        body: {
          ...aValidPayload,
          ...options,
        },
      });

    it('calls the next function when there are no validation errors', () => {
      // Arrange
      const { req, res } = getHttpMocks({
        reportId: 1,
        fileInfo: MOCK_AZURE_FILE_INFO,
        reportData: [{ 'a header': 'a value', 'another header': null }],
        user: {
          _id: userId,
        },
      });
      jest.mocked(validateUtilisationReportCsvData).mockReturnValue([]);

      // Act
      validatePostUploadUtilisationReportPayload(req, res, mockNext);

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
      validatePostUploadUtilisationReportPayload(req, res, mockNext);

      // Assert
      expect(mockNext).not.toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(HttpStatusCode.BadRequest);
    });

    it.each`
      condition                        | value
      ${'undefined'}                   | ${undefined}
      ${'null'}                        | ${null}
      ${'object'}                      | ${{}}
      ${'string'}                      | ${'some data'}
      ${'item properties not strings'} | ${[{ key: {} }]}
    `('responds with an error if the reportData is invalid (case: $condition)', ({ value }: { value: unknown }) => {
      // Arrange
      const { req, res } = getHttpMocks({
        reportData: value,
      });

      // Act
      validatePostUploadUtilisationReportPayload(req, res, mockNext);

      // Assert
      expect(mockNext).not.toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(HttpStatusCode.BadRequest);
    });

    it('responds with an error if the reportData contains validation errors', () => {
      // Arrange
      const { req, res } = getHttpMocks({
        reportData: [{ 'a header': 'a value' }],
      });
      jest.mocked(validateUtilisationReportCsvData).mockReturnValue([{ errorMessage: 'That is not valid report data' }]);

      // Act
      validatePostUploadUtilisationReportPayload(req, res, mockNext);

      // Assert
      expect(mockNext).not.toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(HttpStatusCode.BadRequest);
    });
  });
});
