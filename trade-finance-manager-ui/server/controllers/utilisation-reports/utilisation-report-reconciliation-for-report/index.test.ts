import httpMocks from 'node-mocks-http';
import { SessionData } from 'express-session';
import { CurrencyAndAmountString } from '@ukef/dtfs2-common';
import api from '../../../api';
import { getUtilisationReportReconciliationByReportId } from '.';
import { MOCK_TFM_SESSION_USER } from '../../../test-mocks/mock-tfm-session-user';
import { PRIMARY_NAVIGATION_KEYS } from '../../../constants';
import { aFeeRecordPaymentGroupItem, aUtilisationReportReconciliationDetailsResponse } from '../../../../test-helpers';
import { UtilisationReportReconciliationDetailsResponseBody } from '../../../api-response-types';
import { ErrorSummaryViewModel, FeeRecordPaymentGroupViewModelItem, UtilisationReportReconciliationForReportViewModel } from '../../../types/view-models';

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
        session: { ...session, ...sessionData },
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
        feeRecordPaymentGroups: [
          {
            feeRecords: [
              {
                id: 1,
                facilityId: '12345678',
                exporter: 'Test exporter',
                reportedFees: { currency: 'GBP', amount: 100 },
                reportedPayments: { currency: 'GBP', amount: 100 },
              },
            ],
            totalReportedPayments: { currency: 'GBP', amount: 100 },
            paymentsReceived: [{ currency: 'GBP', amount: 100 }],
            totalPaymentsReceived: { currency: 'GBP', amount: 100 },
            status: 'TO_DO',
          },
        ],
      };
      const formattedReportPeriod = 'January 2024';

      const feeRecordPaymentGroupViewModel: FeeRecordPaymentGroupViewModelItem[] = [
        {
          feeRecords: [
            {
              id: 1,
              facilityId: '12345678',
              exporter: 'Test exporter',
              reportedFees: 'GBP 100.00',
              reportedPayments: 'GBP 100.00',
            },
          ],
          totalReportedPayments: {
            formattedCurrencyAndAmount: 'GBP 100.00',
            dataSortValue: 0,
          },
          paymentsReceived: ['GBP 100.00' as CurrencyAndAmountString],
          totalPaymentsReceived: {
            formattedCurrencyAndAmount: 'GBP 100.00',
            dataSortValue: 0,
          },
          status: 'TO_DO',
          displayStatus: 'TO DO',
          checkboxId: 'feeRecordIds-1-reportedPaymentsCurrency-GBP-status-TO_DO',
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
        enablePaymentsReceivedSorting: true,
        reportId: '1',
        feeRecordPaymentGroups: feeRecordPaymentGroupViewModel,
        errorSummary: undefined,
      });
    });

    it('sets error summary to contain passed in session data and checks selected checkboxes', async () => {
      // Arrange
      const sessionData: Partial<SessionData> = {
        addPaymentErrorKey: 'different-fee-record-statuses',
        checkedCheckboxIds: {
          'feeRecordIds-1-reportedPaymentsCurrency-GBP-status-TO_DO': true,
        },
      };
      const { req, res } = getHttpMocksWithSessionData(sessionData);

      const utilisationReportReconciliationDetails: UtilisationReportReconciliationDetailsResponseBody = {
        ...aUtilisationReportReconciliationDetailsResponse(),
        feeRecordPaymentGroups: [aFeeRecordPaymentGroupItem()],
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
      expect(viewModel.feeRecordPaymentGroups[0].isChecked).toBe(true);
    });

    it("renders the page with 'enablePaymentsReceivedSorting' set to true if at least one fee record has a non-null 'paymentsReceived'", async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      const utilisationReportReconciliationDetails: UtilisationReportReconciliationDetailsResponseBody = {
        ...aUtilisationReportReconciliationDetailsResponse(),
        feeRecordPaymentGroups: [
          {
            ...aFeeRecordPaymentGroupItem(),
            paymentsReceived: null,
            totalPaymentsReceived: null,
          },
          {
            ...aFeeRecordPaymentGroupItem(),
            paymentsReceived: [{ currency: 'GBP', amount: 100 }],
            totalPaymentsReceived: { currency: 'GBP', amount: 100 },
          },
        ],
      };

      jest.mocked(api.getUtilisationReportReconciliationDetailsById).mockResolvedValue(utilisationReportReconciliationDetails);

      // Act
      await getUtilisationReportReconciliationByReportId(req, res);

      // Assert
      expect(res._getRenderView()).toEqual('utilisation-reports/utilisation-report-reconciliation-for-report.njk');
      const viewModel = res._getRenderData() as UtilisationReportReconciliationForReportViewModel;
      expect(viewModel.enablePaymentsReceivedSorting).toBe(true);
    });

    it("renders the page with 'enablePaymentsReceivedSorting' set to false if all fee records have null 'paymentsReceived'", async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      const utilisationReportReconciliationDetails: UtilisationReportReconciliationDetailsResponseBody = {
        ...aUtilisationReportReconciliationDetailsResponse(),
        feeRecordPaymentGroups: [
          {
            ...aFeeRecordPaymentGroupItem(),
            paymentsReceived: null,
            totalPaymentsReceived: null,
          },
          {
            ...aFeeRecordPaymentGroupItem(),
            paymentsReceived: null,
            totalPaymentsReceived: null,
          },
        ],
      };

      jest.mocked(api.getUtilisationReportReconciliationDetailsById).mockResolvedValue(utilisationReportReconciliationDetails);

      // Act
      await getUtilisationReportReconciliationByReportId(req, res);

      // Assert
      expect(res._getRenderView()).toEqual('utilisation-reports/utilisation-report-reconciliation-for-report.njk');
      const viewModel = res._getRenderData() as UtilisationReportReconciliationForReportViewModel;
      expect(viewModel.enablePaymentsReceivedSorting).toBe(false);
    });
  });
});
