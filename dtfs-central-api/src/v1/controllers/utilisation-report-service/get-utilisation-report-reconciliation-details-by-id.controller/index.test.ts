import httpMocks from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import { ApiError } from '@ukef/dtfs2-common';
import { GetUtilisationReportReconciliationDetailsByIdRequest, getUtilisationReportReconciliationDetailsById } from '.';
import { getUtilisationReportReconciliationDetails } from './helpers';
import { UtilisationReportReconciliationDetails } from '../../../../types/utilisation-reports';
import { aReportPeriod } from '../../../../../test-helpers/test-data/report-period';

jest.mock('./helpers');

console.error = jest.fn();

class TestApiError extends ApiError {
  constructor(status?: number, message?: string) {
    super({ status: status ?? 500, message: message ?? '' });
  }
}

describe('get-utilisation-report-reconciliation-details-by-id.controller', () => {
  describe('getUtilisationReportReconciliationDetailsById', () => {
    const reportId = 1;
    const getHttpMocks = (facilityIdQuery: string | undefined = undefined) =>
      httpMocks.createMocks<GetUtilisationReportReconciliationDetailsByIdRequest>({
        params: {
          reportId,
        },
        query: {
          facilityIdQuery,
        },
      });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it("responds with the specific error message if saving the report throws an 'ApiError'", async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      const errorMessage = 'Some error message';
      jest.mocked(getUtilisationReportReconciliationDetails).mockRejectedValue(new TestApiError(undefined, errorMessage));

      // Act
      await getUtilisationReportReconciliationDetailsById(req, res);

      // Assert
      expect(res._getData()).toBe(`Failed to get utilisation report reconciliation for report with id '${reportId}': ${errorMessage}`);
    });

    it('responds with a 500 if an unknown error occurs', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      jest.mocked(getUtilisationReportReconciliationDetails).mockRejectedValue(new Error('Some error'));

      // Act
      await getUtilisationReportReconciliationDetailsById(req, res);

      // Assert
      expect(res._getStatusCode()).toBe(HttpStatusCode.InternalServerError);
    });

    it('responds with a generic error message if an unknown error occurs', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      jest.mocked(getUtilisationReportReconciliationDetails).mockRejectedValue(new Error('Some error'));

      // Act
      await getUtilisationReportReconciliationDetailsById(req, res);

      // Assert
      expect(res._getData()).toBe(`Failed to get utilisation report reconciliation for report with id '${reportId}'`);
    });

    it('fetches details and responds with 200 when there is no query provided', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      const reportDetails = aUtilisationReportReconciliationDetails();
      jest.mocked(getUtilisationReportReconciliationDetails).mockResolvedValue(reportDetails);

      // Act
      await getUtilisationReportReconciliationDetailsById(req, res);

      // Assert
      expect(res._getStatusCode()).toBe(HttpStatusCode.Ok);
      expect(res._getData()).toBe(reportDetails);
      expect(getUtilisationReportReconciliationDetails).toHaveBeenCalledTimes(1);
      expect(getUtilisationReportReconciliationDetails).toHaveBeenCalledWith(reportId, undefined);
    });

    it('fetches details filtering by facility id query and responds with 200 when there is a facility id query provided', async () => {
      // Arrange
      const query = '1234';
      const { req, res } = getHttpMocks(query);

      const reportDetails = aUtilisationReportReconciliationDetails();
      jest.mocked(getUtilisationReportReconciliationDetails).mockResolvedValue(reportDetails);

      // Act
      await getUtilisationReportReconciliationDetailsById(req, res);

      // Assert
      expect(res._getStatusCode()).toBe(HttpStatusCode.Ok);
      expect(res._getData()).toBe(reportDetails);
      expect(getUtilisationReportReconciliationDetails).toHaveBeenCalledTimes(1);
      expect(getUtilisationReportReconciliationDetails).toHaveBeenCalledWith(reportId, '1234');
    });

    it('fetches details filtering without filtering and responds with 200 when there is an invalid facility id query', async () => {
      // Arrange
      const query = '123';
      const { req, res } = getHttpMocks(query);

      const reportDetails = aUtilisationReportReconciliationDetails();
      jest.mocked(getUtilisationReportReconciliationDetails).mockResolvedValue(reportDetails);

      // Act
      await getUtilisationReportReconciliationDetailsById(req, res);

      // Assert
      expect(res._getStatusCode()).toBe(HttpStatusCode.Ok);
      expect(res._getData()).toBe(reportDetails);
      expect(getUtilisationReportReconciliationDetails).toHaveBeenCalledTimes(1);
      expect(getUtilisationReportReconciliationDetails).toHaveBeenCalledWith(reportId, undefined);
    });

    function aUtilisationReportReconciliationDetails(): UtilisationReportReconciliationDetails {
      return {
        reportId,
        bank: {
          id: '123',
          name: 'bank',
        },
        status: 'PENDING_RECONCILIATION',
        reportPeriod: aReportPeriod(),
        dateUploaded: new Date(),
        feeRecordPaymentGroups: [],
      };
    }
  });
});
