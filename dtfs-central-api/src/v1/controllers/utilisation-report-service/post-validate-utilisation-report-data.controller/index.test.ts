import httpMocks from 'node-mocks-http';
import { ApiError } from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import { PostValidateUtilisationReportDataPayload } from '../../../routes/middleware/payload-validation';
import { postValidateUtilisationReportData, PostValidateUtilisationReportDataRequest } from '.';
import { validateUtilisationReportCsvData } from '../../../../services/utilisation-report-data-validator';

jest.mock('../../../../services/utilisation-report-data-validator');

console.error = jest.fn();

class TestApiError extends ApiError {
  constructor(status?: number, message?: string) {
    super({ status: status ?? 500, message: message ?? '' });
  }
}

describe('post-validate-utilisation-report-data.controller', () => {
  describe('postValidateUtilisationReportData', () => {
    const aValidRequestBody = (): PostValidateUtilisationReportDataPayload => ({
      reportData: [{ header: { value: 'value', column: 'A', row: '1' } }],
    });

    it('return 200 (Ok) and validation errors when successfully validates the report data', () => {
      // Arrange
      const reportData = [{ header: { value: 'value', column: 'A', row: '1' } }];
      const req = httpMocks.createRequest<PostValidateUtilisationReportDataRequest>({
        body: { reportData },
      });
      const res = httpMocks.createResponse();

      jest.mocked(validateUtilisationReportCsvData).mockReturnValue([{ errorMessage: 'Data invalid!' }]);

      // Act
      postValidateUtilisationReportData(req, res);

      // Assert
      expect(validateUtilisationReportCsvData).toHaveBeenCalledWith(reportData);
      expect(res._getStatusCode()).toBe(HttpStatusCode.Ok);
      expect(res._getData()).toEqual({ csvValidationErrors: [{ errorMessage: 'Data invalid!' }] });
    });

    it("responds with the specific error status if saving the report throws an 'ApiError'", () => {
      // Arrange
      const req = httpMocks.createRequest<PostValidateUtilisationReportDataRequest>({
        body: aValidRequestBody(),
      });
      const res = httpMocks.createResponse();

      const errorStatus = 404;
      jest.mocked(validateUtilisationReportCsvData).mockImplementation(() => {
        throw new TestApiError(errorStatus, undefined);
      });

      // Act
      postValidateUtilisationReportData(req, res);

      // Assert
      expect(res._getStatusCode()).toBe(errorStatus);
    });

    it("responds with the specific error message if saving the report throws an 'ApiError'", () => {
      // Arrange
      const req = httpMocks.createRequest<PostValidateUtilisationReportDataRequest>({
        body: aValidRequestBody(),
      });
      const res = httpMocks.createResponse();

      const errorMessage = 'Some error message';
      jest.mocked(validateUtilisationReportCsvData).mockImplementation(() => {
        throw new TestApiError(undefined, errorMessage);
      });

      // Act
      postValidateUtilisationReportData(req, res);

      // Assert
      expect(res._getData()).toBe(`Failed to add a new payment: ${errorMessage}`);
    });

    it("responds with a '500' if an unknown error occurs", () => {
      // Arrange
      const req = httpMocks.createRequest<PostValidateUtilisationReportDataRequest>({
        body: aValidRequestBody(),
      });
      const res = httpMocks.createResponse();

      jest.mocked(validateUtilisationReportCsvData).mockImplementation(() => {
        throw new Error('Some error');
      });

      // Act
      postValidateUtilisationReportData(req, res);

      // Assert
      expect(res._getStatusCode()).toBe(HttpStatusCode.InternalServerError);
    });

    it('responds with a generic error message if an unknown error occurs', () => {
      // Arrange
      const req = httpMocks.createRequest<PostValidateUtilisationReportDataRequest>({
        body: aValidRequestBody(),
      });
      const res = httpMocks.createResponse();

      jest.mocked(validateUtilisationReportCsvData).mockImplementation(() => {
        throw new Error('Some error');
      });

      // Act
      postValidateUtilisationReportData(req, res);

      // Assert
      expect(res._getData()).toBe('Failed to add a new payment');
    });
  });
});
