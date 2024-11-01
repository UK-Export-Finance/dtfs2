import httpMocks from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import { when } from 'jest-when';
import { TestApiError, UtilisationReportEntityMockBuilder, PremiumPaymentsFilters, UTILISATION_REPORT_STATUS } from '@ukef/dtfs2-common';
import { GetUtilisationReportReconciliationDetailsByIdRequest, getUtilisationReportReconciliationDetailsById } from '.';
import { getUtilisationReportReconciliationDetails } from './helpers';
import { UtilisationReportReconciliationDetails } from '../../../../types/utilisation-reports';
import { aReportPeriod } from '../../../../../test-helpers';
import { UtilisationReportRepo } from '../../../../repositories/utilisation-reports-repo';

jest.mock('./helpers');

console.error = jest.fn();

describe('get-utilisation-report-reconciliation-details-by-id.controller', () => {
  describe('getUtilisationReportReconciliationDetailsById', () => {
    const reportId = 1;
    const getHttpMocks = (premiumPaymentsFilters?: PremiumPaymentsFilters) =>
      httpMocks.createMocks<GetUtilisationReportReconciliationDetailsByIdRequest>({
        params: {
          reportId,
        },
        query: {
          premiumPaymentsFilters,
        },
      });

    const utilisationReportRepoFindSpy = jest.spyOn(UtilisationReportRepo, 'findOneByIdWithFeeRecordsWithPayments');

    beforeEach(() => {
      utilisationReportRepoFindSpy.mockRejectedValue(new Error('Some error'));
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it("responds with the specific error message if getting the report throws an 'ApiError'", async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      const errorMessage = 'Some error message';
      when(utilisationReportRepoFindSpy).calledWith(reportId).mockRejectedValue(new TestApiError(undefined, errorMessage));

      // Act
      await getUtilisationReportReconciliationDetailsById(req, res);

      // Assert
      expect(res._getData()).toEqual(`Failed to get utilisation report reconciliation for report with id '${reportId}': ${errorMessage}`);
    });

    it('responds with a 500 if an unknown error occurs', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      when(utilisationReportRepoFindSpy).calledWith(reportId).mockRejectedValue(new Error('Some error'));

      // Act
      await getUtilisationReportReconciliationDetailsById(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.InternalServerError);
    });

    it('responds with a generic error message if an unknown error occurs', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      when(utilisationReportRepoFindSpy).calledWith(reportId).mockRejectedValue(new Error('Some error'));

      // Act
      await getUtilisationReportReconciliationDetailsById(req, res);

      // Assert
      expect(res._getData()).toEqual(`Failed to get utilisation report reconciliation for report with id '${reportId}'`);
    });

    it('fetches details and responds with 200 when there are no filters provided', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      const utilisationReport = UtilisationReportEntityMockBuilder.forStatus(UTILISATION_REPORT_STATUS.RECONCILIATION_IN_PROGRESS).withId(reportId).build();
      when(utilisationReportRepoFindSpy).calledWith(reportId).mockResolvedValue(utilisationReport);

      const reportDetails = aUtilisationReportReconciliationDetails();
      jest.mocked(getUtilisationReportReconciliationDetails).mockResolvedValue(reportDetails);

      const expectedPaymentDetailsTabParsedFilters = {};
      const expectedPremiumPaymentsTabParsedFilters = {};

      // Act
      await getUtilisationReportReconciliationDetailsById(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
      expect(res._getData()).toEqual(reportDetails);
      expect(getUtilisationReportReconciliationDetails).toHaveBeenCalledTimes(1);
      expect(getUtilisationReportReconciliationDetails).toHaveBeenCalledWith(
        utilisationReport,
        expectedPaymentDetailsTabParsedFilters,
        expectedPremiumPaymentsTabParsedFilters,
      );
    });

    it('fetches details filtering by premium payments tab facility id value and responds with 200 when there is a facility id value provided', async () => {
      // Arrange
      const premiumPaymentsFilters = {
        facilityId: '1234',
      };
      const { req, res } = getHttpMocks(premiumPaymentsFilters);

      const utilisationReport = UtilisationReportEntityMockBuilder.forStatus(UTILISATION_REPORT_STATUS.RECONCILIATION_IN_PROGRESS).withId(reportId).build();
      when(utilisationReportRepoFindSpy).calledWith(reportId).mockResolvedValue(utilisationReport);

      const reportDetails = aUtilisationReportReconciliationDetails();
      jest.mocked(getUtilisationReportReconciliationDetails).mockResolvedValue(reportDetails);

      const expectedPaymentDetailsTabParsedFilters = {};
      const expectedPremiumPaymentsTabParsedFilters = {
        facilityId: '1234',
      };

      // Act
      await getUtilisationReportReconciliationDetailsById(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
      expect(res._getData()).toEqual(reportDetails);
      expect(getUtilisationReportReconciliationDetails).toHaveBeenCalledTimes(1);
      expect(getUtilisationReportReconciliationDetails).toHaveBeenCalledWith(
        utilisationReport,
        expectedPaymentDetailsTabParsedFilters,
        expectedPremiumPaymentsTabParsedFilters,
      );
    });

    function aUtilisationReportReconciliationDetails(): UtilisationReportReconciliationDetails {
      return {
        reportId,
        bank: {
          id: '123',
          name: 'bank',
        },
        status: UTILISATION_REPORT_STATUS.PENDING_RECONCILIATION,
        reportPeriod: aReportPeriod(),
        dateUploaded: new Date(),
        premiumPayments: [],
        paymentDetails: [],
        keyingSheet: [],
        utilisationDetails: [],
      };
    }
  });
});
