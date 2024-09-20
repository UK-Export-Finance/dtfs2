import httpMocks from 'node-mocks-http';
import { SessionData } from 'express-session';
import { FEE_RECORD_STATUS } from '@ukef/dtfs2-common';
import api from '../../../api';
import { getUtilisationReportReconciliationByReportId } from '.';
import { MOCK_TFM_SESSION_USER } from '../../../test-mocks/mock-tfm-session-user';
import { PRIMARY_NAVIGATION_KEYS } from '../../../constants';
import { aFeeRecordPaymentGroup, aUtilisationReportReconciliationDetailsResponse, aPayment, aFeeRecord } from '../../../../test-helpers';
import { FeeRecordPaymentGroup, UtilisationReportReconciliationDetailsResponseBody } from '../../../api-response-types';
import { PremiumPaymentsViewModelItem, PaymentDetailsViewModel, UtilisationReportReconciliationForReportViewModel } from '../../../types/view-models';

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
    const facilityIdQuery = '1234';
    const originalUrl = '?facilityIdQuery';

    const getHttpMocksWithSessionData = (sessionData: Partial<SessionData>) =>
      httpMocks.createMocks({
        session: { ...session, ...sessionData },
        params: {
          reportId,
        },
        query: {
          facilityIdQuery,
        },
        originalUrl,
      });

    const getHttpMocks = () => getHttpMocksWithSessionData({});

    it("renders the '/problem-with-service' if the api responds with an error", async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      const premiumPaymentsTabFilters = {
        facilityId: facilityIdQuery,
      };

      jest.mocked(api.getUtilisationReportReconciliationDetailsById).mockRejectedValue(new Error('Some error'));

      // Act
      await getUtilisationReportReconciliationByReportId(req, res);

      // Assert
      expect(api.getUtilisationReportReconciliationDetailsById).toHaveBeenCalledWith(reportId, premiumPaymentsTabFilters, userToken);
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
      const feeRecordPaymentGroups: FeeRecordPaymentGroup[] = [
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
          paymentsReceived: [{ id: 1, currency: 'GBP', amount: 100, dateReceived: new Date('2024-01-01').toISOString() }],
          totalPaymentsReceived: { currency: 'GBP', amount: 100 },
          status: FEE_RECORD_STATUS.MATCH,
          reconciledByUser: undefined,
          dateReconciled: undefined,
        },
      ];
      const utilisationReportReconciliationDetails: UtilisationReportReconciliationDetailsResponseBody = {
        ...aUtilisationReportReconciliationDetailsResponse(),
        bank,
        reportPeriod: {
          start: { month: 1, year: 2024 },
          end: { month: 1, year: 2024 },
        },
        premiumPayments: feeRecordPaymentGroups,
        paymentDetails: feeRecordPaymentGroups,
      };
      const formattedReportPeriod = 'January 2024';

      const premiumPayments: PremiumPaymentsViewModelItem[] = [
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
          paymentsReceived: [{ id: 1, formattedCurrencyAndAmount: 'GBP 100.00' }],
          totalPaymentsReceived: {
            formattedCurrencyAndAmount: 'GBP 100.00',
            dataSortValue: 0,
          },
          status: FEE_RECORD_STATUS.MATCH,
          displayStatus: 'MATCH',
          checkboxId: 'feeRecordIds-1-reportedPaymentsCurrency-GBP-status-MATCH',
          isChecked: false,
          checkboxAriaLabel: 'Select 12345678',
        },
      ];

      const paymentDetailsViewModel: PaymentDetailsViewModel = [
        {
          payment: {
            id: 1,
            amount: { formattedCurrencyAndAmount: 'GBP 100.00', dataSortValue: 0 },
            dateReceived: { formattedDateReceived: '1 Jan 2024', dataSortValue: 0 },
            reference: undefined,
          },
          feeRecords: [{ id: 2, facilityId: '12345678', exporter: 'Test exporter' }],
          feeRecordPaymentGroupStatus: FEE_RECORD_STATUS.MATCH,
          reconciledBy: '-',
          dateReconciled: { formattedDateReconciled: '-', dataSortValue: 0 },
        },
      ];

      const premiumPaymentsTabFilters = {
        facilityId: facilityIdQuery,
      };

      jest.mocked(api.getUtilisationReportReconciliationDetailsById).mockResolvedValue(utilisationReportReconciliationDetails);

      // Act
      await getUtilisationReportReconciliationByReportId(req, res);

      // Assert
      expect(api.getUtilisationReportReconciliationDetailsById).toHaveBeenCalledWith(reportId, premiumPaymentsTabFilters, userToken);
      expect(res._getRenderView()).toEqual('utilisation-reports/utilisation-report-reconciliation-for-report.njk');
      expect(res._getRenderData()).toEqual<UtilisationReportReconciliationForReportViewModel>({
        user: MOCK_TFM_SESSION_USER,
        activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.UTILISATION_REPORTS,
        bank,
        formattedReportPeriod,
        enablePaymentsReceivedSorting: true,
        reportId: '1',
        premiumPayments,
        facilityIdQuery,
        keyingSheet: [],
        paymentDetails: paymentDetailsViewModel,
      });
    });

    it('sets add payment error to contain passed in session data and checks selected checkboxes', async () => {
      // Arrange
      const sessionData: Partial<SessionData> = {
        addPaymentErrorKey: 'different-fee-record-statuses',
        checkedCheckboxIds: {
          'feeRecordIds-1-reportedPaymentsCurrency-GBP-status-TO_DO': true,
        },
      };
      const { req, res } = getHttpMocksWithSessionData(sessionData);

      const feeRecordPaymentGroups = [aFeeRecordPaymentGroup()];
      const utilisationReportReconciliationDetails: UtilisationReportReconciliationDetailsResponseBody = {
        ...aUtilisationReportReconciliationDetailsResponse(),
        premiumPayments: feeRecordPaymentGroups,
        paymentDetails: feeRecordPaymentGroups,
      };

      jest.mocked(api.getUtilisationReportReconciliationDetailsById).mockResolvedValue(utilisationReportReconciliationDetails);

      // Act
      await getUtilisationReportReconciliationByReportId(req, res);

      // Assert
      expect(res._getRenderView()).toEqual('utilisation-reports/utilisation-report-reconciliation-for-report.njk');
      const viewModel = res._getRenderData() as UtilisationReportReconciliationForReportViewModel;
      expect(viewModel.tableDataError).toBeDefined();
      expect(viewModel.tableDataError?.href).toBe('#premium-payments-table');
      expect(viewModel.tableDataError?.text).toBe('Select a fee or fees with the same status');
      expect(viewModel.premiumPayments[0].isChecked).toBe(true);
    });

    it("renders the page with 'enablePaymentsReceivedSorting' set to true if at least one fee record has a non-null 'paymentsReceived'", async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      const feeRecordPaymentGroups: FeeRecordPaymentGroup[] = [
        aFeeRecordPaymentGroupWithoutReceivedPayments(),
        {
          ...aFeeRecordPaymentGroup(),
          paymentsReceived: [{ ...aPayment(), id: 1, currency: 'GBP', amount: 100 }],
          totalPaymentsReceived: { currency: 'GBP', amount: 100 },
        },
      ];
      const utilisationReportReconciliationDetails: UtilisationReportReconciliationDetailsResponseBody = {
        ...aUtilisationReportReconciliationDetailsResponse(),
        premiumPayments: feeRecordPaymentGroups,
        paymentDetails: feeRecordPaymentGroups,
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

      const feeRecordPaymentGroups = [aFeeRecordPaymentGroupWithoutReceivedPayments(), aFeeRecordPaymentGroupWithoutReceivedPayments()];
      const utilisationReportReconciliationDetails: UtilisationReportReconciliationDetailsResponseBody = {
        ...aUtilisationReportReconciliationDetailsResponse(),
        premiumPayments: feeRecordPaymentGroups,
        paymentDetails: feeRecordPaymentGroups,
      };

      jest.mocked(api.getUtilisationReportReconciliationDetailsById).mockResolvedValue(utilisationReportReconciliationDetails);

      // Act
      await getUtilisationReportReconciliationByReportId(req, res);

      // Assert
      expect(res._getRenderView()).toEqual('utilisation-reports/utilisation-report-reconciliation-for-report.njk');
      const viewModel = res._getRenderData() as UtilisationReportReconciliationForReportViewModel;
      expect(viewModel.enablePaymentsReceivedSorting).toBe(false);
    });

    it('sets facility ID query error when invalid facility ID query value used', async () => {
      // Arrange
      const facilityIdQueryParam = 'abc';
      const { req, res } = httpMocks.createMocks({
        session,
        params: {
          reportId,
        },
        query: {
          facilityIdQuery: facilityIdQueryParam,
        },
        originalUrl,
      });

      const feeRecordPaymentGroups = [aFeeRecordPaymentGroupWithoutReceivedPayments(), aFeeRecordPaymentGroupWithoutReceivedPayments()];
      const utilisationReportReconciliationDetails: UtilisationReportReconciliationDetailsResponseBody = {
        ...aUtilisationReportReconciliationDetailsResponse(),
        premiumPayments: feeRecordPaymentGroups,
        paymentDetails: feeRecordPaymentGroups,
      };

      jest.mocked(api.getUtilisationReportReconciliationDetailsById).mockResolvedValue(utilisationReportReconciliationDetails);

      // Act
      await getUtilisationReportReconciliationByReportId(req, res);

      // Assert
      expect(res._getRenderView()).toEqual('utilisation-reports/utilisation-report-reconciliation-for-report.njk');
      const viewModel = res._getRenderData() as UtilisationReportReconciliationForReportViewModel;
      expect(viewModel.filterError).toBeDefined();
      expect(viewModel.filterError?.href).toBe('#facility-id-filter');
      expect(viewModel.filterError?.text).toBe('Facility ID must be a number');
    });

    it('checks selected checkboxes when selected fee record ids query param defined', async () => {
      // Arrange
      const selectedFeeRecordIdsQueryParam = '1,2,3';
      const { req, res } = httpMocks.createMocks({
        session,
        params: { reportId },
        query: {
          facilityIdQuery,
          selectedFeeRecordIds: selectedFeeRecordIdsQueryParam,
        },
        originalUrl,
      });

      const feeRecordPaymentGroups = [
        {
          ...aFeeRecordPaymentGroup(),
          feeRecords: [
            { ...aFeeRecord(), id: 1 },
            { ...aFeeRecord(), id: 2 },
          ],
        },
        {
          ...aFeeRecordPaymentGroup(),
          feeRecords: [{ ...aFeeRecord(), id: 3 }],
        },
        {
          ...aFeeRecordPaymentGroup(),
          feeRecords: [{ ...aFeeRecord(), id: 4 }],
        },
      ];
      const utilisationReportReconciliationDetails: UtilisationReportReconciliationDetailsResponseBody = {
        ...aUtilisationReportReconciliationDetailsResponse(),
        premiumPayments: feeRecordPaymentGroups,
        paymentDetails: feeRecordPaymentGroups,
      };

      jest.mocked(api.getUtilisationReportReconciliationDetailsById).mockResolvedValue(utilisationReportReconciliationDetails);

      // Act
      await getUtilisationReportReconciliationByReportId(req, res);

      // Assert
      const viewModel = res._getRenderData() as UtilisationReportReconciliationForReportViewModel;
      expect(viewModel.premiumPayments[0].isChecked).toBe(true);
      expect(viewModel.premiumPayments[1].isChecked).toBe(true);
      expect(viewModel.premiumPayments[2].isChecked).toBe(false);
    });

    it('clears redirect session data', async () => {
      // Arrange
      const sessionData: Partial<SessionData> = {
        addPaymentErrorKey: 'no-fee-records-selected',
        checkedCheckboxIds: {
          'feeRecordIds-1-reportedPaymentsCurrency-GBP-status-TO_DO': true,
        },
        generateKeyingDataErrorKey: 'no-matching-fee-records',
      };
      const { req, res } = getHttpMocksWithSessionData(sessionData);

      jest.mocked(api.getUtilisationReportReconciliationDetailsById).mockResolvedValue(aUtilisationReportReconciliationDetailsResponse());

      // Act
      await getUtilisationReportReconciliationByReportId(req, res);

      // Assert
      expect(req.session.addPaymentErrorKey).toBeUndefined();
      expect(req.session.checkedCheckboxIds).toBeUndefined();
      expect(req.session.generateKeyingDataErrorKey).toBeUndefined();
    });

    function aFeeRecordPaymentGroupWithoutReceivedPayments(): FeeRecordPaymentGroup {
      return {
        ...aFeeRecordPaymentGroup(),
        paymentsReceived: null,
        totalPaymentsReceived: null,
      };
    }
  });
});
