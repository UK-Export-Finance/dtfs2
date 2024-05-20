import httpMocks from 'node-mocks-http';
import { SessionData } from 'express-session';
import api from '../../../api';
import { getUtilisationReportReconciliationByReportId } from '.';
import { MOCK_TFM_SESSION_USER } from '../../../test-mocks/mock-tfm-session-user';
import { PRIMARY_NAVIGATION_KEYS } from '../../../constants';
import { aUtilisationReportReconciliationDetailsResponse } from '../../../../test-helpers';
import { UtilisationReportReconciliationDetailsResponseBody } from '../../../api-response-types';
import { ErrorSummaryViewModel, FeeRecordViewModelItem, UtilisationReportReconciliationForReportViewModel } from '../../../types/view-models';

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

    const getHttpMocksWithSessionData = (sessionData: Partial<SessionData>) =>
      httpMocks.createMocks({
        session: { session, ...sessionData },
        params: {
          reportId,
        },
      });

    const getHttpMocks = () => getHttpMocksWithSessionData({});

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
          reportedFees: { formattedCurrencyAndAmount: 'GBP 100.00', dataSortValue: 0 },
          reportedPayments: { formattedCurrencyAndAmount: 'GBP 100.00', dataSortValue: 0 },
          totalReportedPayments: { formattedCurrencyAndAmount: 'GBP 100.00', dataSortValue: 0 },
          paymentsReceived: { formattedCurrencyAndAmount: 'GBP 100.00', dataSortValue: 0 },
          totalPaymentsReceived: { formattedCurrencyAndAmount: 'GBP 100.00', dataSortValue: 0 },
          status: 'TO_DO',
          displayStatus: 'TO DO',
          checkboxId: 'feeRecordId-1-reportedPaymentsCurrency-GBP-status-TO_DO',
          isChecked: false,
        },
      ];

      jest.mocked(api.getUtilisationReportReconciliationDetailsById).mockResolvedValue(utilisationReportReconciliationDetails);

      // Act
      await getUtilisationReportReconciliationByReportId(req, res);

      // Assert
      expect(api.getUtilisationReportReconciliationDetailsById).toHaveBeenCalledWith(reportId, userToken);
      expect(res._getRenderView()).toEqual('utilisation-reports/utilisation-report-reconciliation-for-report.njk');
      expect(res._getRenderData()).toEqual<UtilisationReportReconciliationForReportViewModel>({
        user: MOCK_TFM_SESSION_USER,
        activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.UTILISATION_REPORTS,
        bank,
        formattedReportPeriod,
        reportId: 1,
        feeRecords: feeRecordViewModel,
        errorSummary: undefined,
      });
    });

    it('sets error summary to contain passed in session data and checks selected checkboxes', async () => {
      // Arrange
      const sessionData: Partial<SessionData> = {
        addPaymentErrorKey: 'different-fee-record-statuses',
        checkedCheckboxIds: {
          'feeRecordId-1-reportedPaymentsCurrency-GBP-status-MATCH': true,
        },
      };
      const { req, res } = getHttpMocksWithSessionData(sessionData);

      const utilisationReportReconciliationDetails: UtilisationReportReconciliationDetailsResponseBody = {
        ...aUtilisationReportReconciliationDetailsResponse(),
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

      jest.mocked(api.getUtilisationReportReconciliationDetailsById).mockResolvedValue(utilisationReportReconciliationDetails);

      // Act
      await getUtilisationReportReconciliationByReportId(req, res);

      // Assert
      expect(res._getRenderView()).toEqual('utilisation-reports/utilisation-report-reconciliation-for-report.njk');
      const viewModel = res._getRenderData() as UtilisationReportReconciliationForReportViewModel;
      expect(viewModel.errorSummary).toBeDefined();
      expect((viewModel.errorSummary as [ErrorSummaryViewModel])[0].href).toBe('#different-fee-record-statuses');
      expect((viewModel.errorSummary as [ErrorSummaryViewModel])[0].text).toBe('Select a fee or fees with the same status');
      expect(viewModel.feeRecords[0].isChecked).toBe(true);
    });
  });
});
