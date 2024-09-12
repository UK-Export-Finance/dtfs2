import httpMocks from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import { TestApiError } from '@ukef/dtfs2-common';
import { PostReportDataValidationPayload } from '../../../routes/middleware/payload-validation';
import { postReportDataValidation, PostReportDataValidationRequest } from '.';
import { validateUtilisationReportCsvData } from '../../../../services/utilisation-report-data-validator';

jest.mock('../../../../services/utilisation-report-data-validator');

console.error = jest.fn();

describe('post-report-data-validation.controller', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('postReportDataValidation', () => {
    const aValidRequestBody = (): PostReportDataValidationPayload => ({
      reportData: [{ header: { value: 'value', column: 'A', row: '1' } }],
    });

    it(`respond with a ${HttpStatusCode.Ok} and validation errors when successfully validates the report data`, async () => {
      // Arrange
      const reportData = [{ header: { value: 'value', column: 'A', row: '1' } }];
      const req = httpMocks.createRequest<PostReportDataValidationRequest>({
        body: { reportData },
      });
      const res = httpMocks.createResponse();

      jest.mocked(validateUtilisationReportCsvData).mockResolvedValue([{ errorMessage: 'Data invalid!' }]);

      // Act
      await postReportDataValidation(req, res);

      // Assert
      expect(validateUtilisationReportCsvData).toHaveBeenCalledWith(reportData);
      expect(res._getStatusCode()).toBe(HttpStatusCode.Ok);
      expect(res._getData()).toEqual({ csvValidationErrors: [{ errorMessage: 'Data invalid!' }] });
    });

    it("responds with the specific error status if saving the report throws an 'ApiError'", async () => {
      // Arrange
      const req = httpMocks.createRequest<PostReportDataValidationRequest>({
        body: aValidRequestBody(),
      });
      const res = httpMocks.createResponse();

      const errorStatus = HttpStatusCode.BadRequest;
      jest.mocked(validateUtilisationReportCsvData).mockImplementation(() => {
        throw new TestApiError(errorStatus, undefined);
      });

      // Act
      await postReportDataValidation(req, res);

      // Assert
      expect(res._getStatusCode()).toBe(errorStatus);
    });

    it("responds with the specific error message if saving the report throws an 'ApiError'", async () => {
      // Arrange
      const req = httpMocks.createRequest<PostReportDataValidationRequest>({
        body: aValidRequestBody(),
      });
      const res = httpMocks.createResponse();

      const errorMessage = 'Some error message';
      jest.mocked(validateUtilisationReportCsvData).mockImplementation(() => {
        throw new TestApiError(undefined, errorMessage);
      });

      // Act
      await postReportDataValidation(req, res);

      // Assert
      expect(res._getData()).toBe(`Failed to validate report data: ${errorMessage}`);
    });

    it(`responds with a ${HttpStatusCode.InternalServerError} if an unknown error occurs`, async () => {
      // Arrange
      const req = httpMocks.createRequest<PostReportDataValidationRequest>({
        body: aValidRequestBody(),
      });
      const res = httpMocks.createResponse();

      jest.mocked(validateUtilisationReportCsvData).mockImplementation(() => {
        throw new Error('Some error');
      });

      // Act
      await postReportDataValidation(req, res);

      // Assert
      expect(res._getStatusCode()).toBe(HttpStatusCode.InternalServerError);
    });

    it('responds with a generic error message if an unknown error occurs', async () => {
      // Arrange
      const req = httpMocks.createRequest<PostReportDataValidationRequest>({
        body: aValidRequestBody(),
      });
      const res = httpMocks.createResponse();

      jest.mocked(validateUtilisationReportCsvData).mockImplementation(() => {
        throw new Error('Some error');
      });

      // Act
      await postReportDataValidation(req, res);

      // Assert
      expect(res._getData()).toBe('Failed to validate report data');
    });
  });
});
