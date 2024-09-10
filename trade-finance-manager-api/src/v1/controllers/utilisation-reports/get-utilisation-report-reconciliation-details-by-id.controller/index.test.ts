import httpMocks from 'node-mocks-http';
import { HttpStatusCode, AxiosError, AxiosResponse } from 'axios';
import { GetUtilisationReportReconciliationDetailsByIdRequest, getUtilisationReportReconciliationDetailsById } from '.';
import api from '../../../api';
import { aUtilisationReportReconciliationDetailsResponse } from '../../../../../test-helpers';
import { UtilisationReportReconciliationDetailsResponseBody } from '../../../api-response-types';

console.error = jest.fn();

describe('get-utilisation-report-reconciliation-details-by-id.controller', () => {
  describe('getUtilisationReportReconciliationDetailsById', () => {
    const reportId = 1;
    const getHttpMocks = () =>
      httpMocks.createMocks<GetUtilisationReportReconciliationDetailsByIdRequest>({
        params: {
          reportId: reportId.toString(),
        },
      });

    const apiGetUtilisationReportReconciliationDetailsByIdSpy = jest.spyOn(api, 'getUtilisationReportReconciliationDetailsById');

    const utilisationReportReconciliationDetailsResponse: UtilisationReportReconciliationDetailsResponseBody = {
      ...aUtilisationReportReconciliationDetailsResponse(),
      reportId,
    };

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('responds with a 200 and the report with the correct id', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      apiGetUtilisationReportReconciliationDetailsByIdSpy.mockResolvedValue(utilisationReportReconciliationDetailsResponse);

      // Act
      await getUtilisationReportReconciliationDetailsById(req, res);

      // Assert
      expect(res._getStatusCode()).toBe(HttpStatusCode.Ok);
      expect(res._getData()).toBe(utilisationReportReconciliationDetailsResponse);
    });

    it('fetches report with the premium payments tab filters query param when provided', async () => {
      // Arrange
      const { req, res } = getHttpMocks();
      const premiumPaymentsTabFilters = {
        facilityId: '1234',
      };
      req.query = { premiumPaymentsTabFilters };

      apiGetUtilisationReportReconciliationDetailsByIdSpy.mockResolvedValue(utilisationReportReconciliationDetailsResponse);

      // Act
      await getUtilisationReportReconciliationDetailsById(req, res);

      // Assert
      expect(apiGetUtilisationReportReconciliationDetailsByIdSpy).toHaveBeenCalledWith(reportId.toString(), premiumPaymentsTabFilters);
    });

    it('responds with the specific axios error code when the api throws an error', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      const errorStatus = HttpStatusCode.BadRequest;
      const axiosError = new AxiosError();
      axiosError.message = 'Some error message';
      axiosError.response = { status: errorStatus } as AxiosResponse;

      apiGetUtilisationReportReconciliationDetailsByIdSpy.mockRejectedValue(axiosError);

      // Act
      await getUtilisationReportReconciliationDetailsById(req, res);

      // Assert
      expect(res._getStatusCode()).toBe(errorStatus);
      expect(res._getData()).toBe(`Failed to get utilisation report reconciliation details for report with id '${reportId}': ${axiosError.message}`);
    });

    it('responds with a 500 when an unexpected error occurs', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      apiGetUtilisationReportReconciliationDetailsByIdSpy.mockRejectedValue(new Error('Unknown error'));

      // Act
      await getUtilisationReportReconciliationDetailsById(req, res);

      // Assert
      expect(res._getStatusCode()).toBe(HttpStatusCode.InternalServerError);
      expect(res._getData()).toBe(`Failed to get utilisation report reconciliation details for report with id '${reportId}'`);
    });
  });
});
