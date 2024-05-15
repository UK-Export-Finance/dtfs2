import httpMocks from 'node-mocks-http';
import api from '../../../api';
import { getUtilisationReportReconciliationByReportId } from '.';
import { MOCK_TFM_SESSION_USER } from '../../../test-mocks/mock-tfm-session-user';
import { PRIMARY_NAVIGATION_KEYS } from '../../../constants';
import { aUtilisationReportReconciliationDetailsResponse } from '../../../../test-helpers';
import { UtilisationReportReconciliationDetailsResponseBody } from '../../../api-response-types';
import { FeeRecordViewModelItem } from '../helpers';

jest.mock('../../../api');
jest.mock('../../../helpers/date');

console.error = jest.fn();

describe('controllers/utilisation-reports/utilisation-report-reconciliation-for-report', () => {
  afterAll(() => {
    jest.resetAllMocks();
  });

  describe('getUtilisationReportReconciliationByReportId', () => {
    const userToken = 'user-token';
    const user = MOCK_TFM_SESSION_USER;
    const session = { userToken, user };

    const reportId = '1';

    const getHttpMocks = () =>
      httpMocks.createMocks({
        session,
        params: {
          reportId,
        },
      });

    it("renders the '/problem-with-service' if the api responds with an error", async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      jest.mocked(api.getUtilisationReportReconciliationDetailsById).mockRejectedValue(new Error('Some error'));

      // Act
      await getUtilisationReportReconciliationByReportId(req, res);

      // Assert
      expect(api.getUtilisationReportReconciliationDetailsById).toHaveBeenCalledWith(reportId, userToken);
      expect(res._getRenderView()).toBe('_partials/problem-with-service.njk');
      expect(res._getRenderData()).toEqual({ user });
    });

    it("renders the 'utilisation-report-reconciliation-for-report' page with the correct data", async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      const bank = {
        id: '123',
        name: 'Test bank',
      };
      const utilisationReportReconciliationDetails: UtilisationReportReconciliationDetailsResponseBody = {
        ...aUtilisationReportReconciliationDetailsResponse(),
        bank,
        reportPeriod: {
          start: { month: 1, year: 2024 },
          end: { month: 1, year: 2024 },
        },
        feeRecords: [
          {
            id: 1,
            facilityId: '12345678',
            exporter: 'Test exporter',
            reportedFees: {
              currency: 'GBP',
              amount: 100.0,
            },
            reportedPayments: {
              currency: 'GBP',
              amount: 100.0,
            },
            totalReportedPayments: {
              currency: 'GBP',
              amount: 100.0,
            },
            paymentsReceived: {
              currency: 'GBP',
              amount: 100.0,
            },
            totalPaymentsReceived: {
              currency: 'GBP',
              amount: 100.0,
            },
            status: 'TO_DO',
          },
        ],
      };
      const formattedReportPeriod = 'January 2024';

      const feeRecordViewModel: FeeRecordViewModelItem[] = [
        {
          id: 1,
          facilityId: '12345678',
          exporter: 'Test exporter',
          reportedFees: 'GBP 100.00',
          reportedPayments: 'GBP 100.00',
          totalReportedPayments: 'GBP 100.00',
          paymentsReceived: 'GBP 100.00',
          totalPaymentsReceived: 'GBP 100.00',
          status: 'TO_DO',
          displayStatus: 'TO DO',
        },
      ];

      jest.mocked(api.getUtilisationReportReconciliationDetailsById).mockResolvedValue(utilisationReportReconciliationDetails);

      // Act
      await getUtilisationReportReconciliationByReportId(req, res);

      // Assert
      expect(api.getUtilisationReportReconciliationDetailsById).toHaveBeenCalledWith(reportId, userToken);
      expect(res._getRenderView()).toEqual('utilisation-reports/utilisation-report-reconciliation-for-report.njk');
      expect(res._getRenderData()).toEqual({
        user: MOCK_TFM_SESSION_USER,
        activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.UTILISATION_REPORTS,
        bank,
        formattedReportPeriod,
        feeRecords: feeRecordViewModel,
      });
    });
  });
});
