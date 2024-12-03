import { MOCK_AZURE_FILE_INFO, Unknown } from '@ukef/dtfs2-common';
import httpMocks from 'node-mocks-http';
import { ObjectId } from 'mongodb';
import { HttpStatusCode } from 'axios';
import { aUtilisationReportRawCsvData } from '../../../../../test-helpers/test-data';
import { getReportDataErrors, validatePostUploadUtilisationReportPayload } from './validate-post-upload-utilisation-report-payload';
import { PostUploadUtilisationReportRequestBody } from '../../../controllers/utilisation-report-service/post-upload-utilisation-report.controller';
import { validateUtilisationReportCsvData } from '../../../../services/utilisation-report-data-validator';

jest.mock('../../../../services/utilisation-report-data-validator');

describe('validate-post-upload-utilisation-report-payload', () => {
  beforeEach(() => {
    jest.mocked(validateUtilisationReportCsvData).mockResolvedValue([]);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getReportDataErrors', () => {
    it('should map data into cell data row format before validation', async () => {
      const data: Record<string, string | null>[] = [
        { 'first row first header': 'first value', 'first row second header': 'second value' },
        { 'other row header': null },
      ];

      await getReportDataErrors(data);

      expect(validateUtilisationReportCsvData).toHaveBeenCalledTimes(1);
      expect(validateUtilisationReportCsvData).toHaveBeenCalledWith([
        { 'first row first header': { value: 'first value', row: 2 }, 'first row second header': { value: 'second value', row: 2 } },
        { 'other row header': { value: null, row: 3 } },
      ]);
    });

    it('should map errors into reduced object without exporter before returning', async () => {
      const data: Record<string, string | null>[] = [];

      jest.mocked(validateUtilisationReportCsvData).mockResolvedValue([
        {
          errorMessage: 'that is not right',
          column: null,
          row: 2,
          value: 'some value',
          exporter: null,
        },
      ]);

      const errors = await getReportDataErrors(data);

      expect(errors).toEqual([{ errorMessage: 'that is not right', row: 2, value: 'some value' }]);
    });
  });

  describe('postUploadUtilisationReportPayloadValidator', () => {
    const mockNext = jest.fn();

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

    it('calls the next function when there are no validation errors', async () => {
      // Arrange
      const { req, res } = getHttpMocks({
        reportId: 1,
        fileInfo: MOCK_AZURE_FILE_INFO,
        reportData: [{ 'a header': 'a value', 'another header': null }],
        user: {
          _id: userId,
        },
      });
      jest.mocked(validateUtilisationReportCsvData).mockResolvedValue([]);

      // Act
      await validatePostUploadUtilisationReportPayload(req, res, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
      expect(res._isEndCalled()).toEqual(false);
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

    it.each(propertyNamesWithInvalidValues)("responds with an error if the '$propertyName' property is invalid", async ({ propertyName, value }) => {
      // Arrange
      const { req, res } = getHttpMocks({
        [propertyName]: value,
      });

      // Act
      await validatePostUploadUtilisationReportPayload(req, res, mockNext);

      // Assert
      expect(mockNext).not.toHaveBeenCalled();
      expect(res._getStatusCode()).toEqual(HttpStatusCode.BadRequest);
    });

    it.each`
      condition                        | value
      ${'undefined'}                   | ${undefined}
      ${'null'}                        | ${null}
      ${'Object'}                      | ${{}}
      ${'string'}                      | ${'some data'}
      ${'item properties not strings'} | ${[{ key: {} }]}
    `('responds with an error if the reportData is invalid (case: $condition)', async ({ value }: { value: unknown }) => {
      // Arrange
      const { req, res } = getHttpMocks({
        reportData: value,
      });

      // Act
      await validatePostUploadUtilisationReportPayload(req, res, mockNext);

      // Assert
      expect(mockNext).not.toHaveBeenCalled();
      expect(res._getStatusCode()).toEqual(HttpStatusCode.BadRequest);
    });

    it('responds with an error if the reportData contains validation errors', async () => {
      // Arrange
      const { req, res } = getHttpMocks({
        reportData: [{ 'a header': 'a value' }],
      });

      jest
        .mocked(validateUtilisationReportCsvData)
        .mockResolvedValue([{ errorMessage: 'That is not valid report data', value: '300', row: 3, column: null, exporter: null }]);

      // Act
      await validatePostUploadUtilisationReportPayload(req, res, mockNext);

      // Assert
      expect(mockNext).not.toHaveBeenCalled();
      expect(res._getStatusCode()).toEqual(HttpStatusCode.BadRequest);
      expect(res._getData()).toEqual([{ errorMessage: 'That is not valid report data', value: '300', row: 3 }]);
    });
  });
});
