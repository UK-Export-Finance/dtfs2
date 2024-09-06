import httpMocks from 'node-mocks-http';
import { AxiosError, AxiosResponse, HttpStatusCode } from 'axios';
import api from '../../api';
import { validateUtilisationReportData, ValidateUtilisationReportDataRequestBody } from './validate-utilisation-report-data.controller';
import { ValidateUtilisationReportDataResponseBody } from '../../api-response-types';

console.error = jest.fn();

jest.mock('../../api');

describe('controllers/utilisation-report-service/validate-utilisation-report-data', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('validateUtilisationReportData', () => {
    const BANK_ID = '956';
    const aValidateUtilisationReportDataRequestBody = (): ValidateUtilisationReportDataRequestBody => ({
      reportData: [{ 'a csv header': { value: 'some value', row: 'A', column: '2' } }],
    });

    const aValidateUtilisationReportDataResponseBody = (): ValidateUtilisationReportDataResponseBody => ({
      csvValidationErrors: [],
    });

    const getHttpMocks = () =>
      httpMocks.createMocks({
        body: aValidateUtilisationReportDataRequestBody(),
        params: { bankId: BANK_ID },
      });

    it('responds with a 200 (Ok) and the returned validation errors when report data is validated successfully', async () => {
      // Arrange
      const { req, res } = getHttpMocks();
      const apiResponse = aValidateUtilisationReportDataResponseBody();
      jest.mocked(api.validateUtilisationReportData).mockResolvedValue(apiResponse);

      // Act
      await validateUtilisationReportData(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
      expect(res._getData()).toEqual(apiResponse);
    });

    it('responds with a 500 (internal server error) if an unknown error occurs', async () => {
      // Arrange
      const { req, res } = getHttpMocks();
      jest.mocked(api.validateUtilisationReportData).mockRejectedValue(new Error('Some error'));

      // Act
      await validateUtilisationReportData(req, res);

      // Assert
      expect(res._getStatusCode()).toBe(HttpStatusCode.InternalServerError);
      expect(res._isEndCalled()).toBe(true);
    });

    it('responds with a specific error code if an axios error is thrown', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      const errorStatus = HttpStatusCode.BadRequest;
      const axiosError = new AxiosError(undefined, undefined, undefined, undefined, { status: errorStatus } as AxiosResponse);

      jest.mocked(api.validateUtilisationReportData).mockRejectedValue(axiosError);

      // Act
      await validateUtilisationReportData(req, res);

      // Assert
      expect(res._getStatusCode()).toBe(errorStatus);
      expect(res._isEndCalled()).toBe(true);
    });

    it('responds with an error message', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      jest.mocked(api.validateUtilisationReportData).mockRejectedValue(new Error('Some error'));

      // Act
      await validateUtilisationReportData(req, res);

      // Assert
      expect(res._getData()).toBe('Failed to validate utilisation report data');
      expect(res._isEndCalled()).toBe(true);
    });
  });
});
