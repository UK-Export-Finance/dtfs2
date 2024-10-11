import httpMocks from 'node-mocks-http';
import { SessionData } from 'express-session';
import { CURRENCY, FEE_RECORD_STATUS, FeeRecordUtilisation } from '@ukef/dtfs2-common';
import api from '../../../api';
import { getUtilisationReportReconciliationByReportId } from '.';
import { MOCK_TFM_SESSION_USER } from '../../../test-mocks/mock-tfm-session-user';
import { PRIMARY_NAVIGATION_KEYS } from '../../../constants';
import { aFeeRecordPaymentGroup, aUtilisationReportReconciliationDetailsResponse, aPayment, aFeeRecord } from '../../../../test-helpers';
import { FeeRecordPaymentGroup, UtilisationReportReconciliationDetailsResponseBody } from '../../../api-response-types';
import {
  PremiumPaymentsViewModelItem,
  PaymentDetailsViewModel,
  UtilisationReportReconciliationForReportViewModel,
  UtilisationDetailsViewModel,
} from '../../../types/view-models';
import { mapPaymentDetailsFiltersToViewModel } from '../helpers';

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
    const premiumPaymentsFacilityId = '11111111';
    const paymentDetailsFacilityId = '22222222';
    const paymentDetailsPaymentCurrency = CURRENCY.GBP;
    const paymentDetailsPaymentReference = 'some-payment-reference';
    const originalUrl = `?premiumPaymentsFacilityId=11111111&paymentDetailsFacilityId=22222222&paymentDetailsPaymentCurrency=${CURRENCY.GBP}&paymentDetailsPaymentReference=some-payment-reference`;

    const getHttpMocksWithSessionData = (sessionData: Partial<SessionData>) =>
      httpMocks.createMocks({
        session: { ...session, ...sessionData },
        params: {
          reportId,
        },
        query: {
          premiumPaymentsFacilityId,
          paymentDetailsFacilityId,
          paymentDetailsPaymentCurrency,
          paymentDetailsPaymentReference,
        },
        originalUrl,
      });

    const getHttpMocks = () => getHttpMocksWithSessionData({});

    it("renders the '/problem-with-service' if the api responds with an error", async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      const premiumPaymentsFilters = {
        facilityId: premiumPaymentsFacilityId,
      };

      const paymentDetailsFilters = {
        facilityId: paymentDetailsFacilityId,
        paymentCurrency: paymentDetailsPaymentCurrency,
        paymentReference: paymentDetailsPaymentReference,
      };

      jest.mocked(api.getUtilisationReportReconciliationDetailsById).mockRejectedValue(new Error('Some error'));

      // Act
      await getUtilisationReportReconciliationByReportId(req, res);

      // Assert
      expect(api.getUtilisationReportReconciliationDetailsById).toHaveBeenCalledWith(reportId, premiumPaymentsFilters, paymentDetailsFilters, userToken);
      expect(res._getRenderView()).toEqual('_partials/problem-with-service.njk');
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
      const utilisationDetails: FeeRecordUtilisation[] = [
        {
          feeRecordId: 1,
          facilityId: '12345678',
          exporter: 'Test exporter',
          baseCurrency: CURRENCY.GBP,
          utilisation: 3,
          value: 4,
          coverPercentage: 80,
          exposure: 2,
          feesAccrued: { currency: CURRENCY.EUR, amount: 5 },
          feesPayable: { currency: CURRENCY.JPY, amount: 2 },
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
        utilisationDetails,
      };
      const formattedReportPeriod = 'January 2024';

      const expectedPremiumPayments: PremiumPaymentsViewModelItem[] = [
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

      const expectedUtilisationDetails: UtilisationDetailsViewModel = {
        utilisationTableRows: [
          {
            feeRecordId: 1,
            facilityId: '12345678',
            exporter: 'Test exporter',
            baseCurrency: CURRENCY.GBP,
            formattedUtilisation: '3.00',
            formattedValue: '4.00',
            coverPercentage: 80,
            formattedExposure: '2.00',
            feesAccrued: { formattedCurrencyAndAmount: `${CURRENCY.EUR} 5.00`, dataSortValue: 0 },
            feesPayable: { formattedCurrencyAndAmount: `${CURRENCY.JPY} 2.00`, dataSortValue: 0 },
          },
        ],
      };

      const premiumPaymentsFilters = {
        facilityId: premiumPaymentsFacilityId,
      };

      const paymentDetailsFilters = {
        facilityId: paymentDetailsFacilityId,
        paymentCurrency: paymentDetailsPaymentCurrency,
        paymentReference: paymentDetailsPaymentReference,
      };

      const expectedPaymentDetailsViewModel: PaymentDetailsViewModel = {
        rows: [
          {
            payment: {
              id: 1,
              amount: { formattedCurrencyAndAmount: 'GBP 100.00', dataSortValue: 0 },
              dateReceived: { formattedDateReceived: '1 Jan 2024', dataSortValue: 0 },
            },
            feeRecords: [{ id: 1, facilityId: '12345678', exporter: 'Test exporter' }],
            feeRecordPaymentGroupStatus: FEE_RECORD_STATUS.MATCH,
            reconciledBy: '-',
            dateReconciled: { formattedDateReconciled: '-', dataSortValue: 0 },
          },
        ],
        filters: mapPaymentDetailsFiltersToViewModel(paymentDetailsFilters),
        filterErrors: {
          errorSummary: [],
        },
        isFilterActive: true,
      };

      jest.mocked(api.getUtilisationReportReconciliationDetailsById).mockResolvedValue(utilisationReportReconciliationDetails);

      // Act
      await getUtilisationReportReconciliationByReportId(req, res);

      // Assert
      expect(api.getUtilisationReportReconciliationDetailsById).toHaveBeenCalledWith(reportId, premiumPaymentsFilters, paymentDetailsFilters, userToken);
      expect(res._getRenderView()).toEqual('utilisation-reports/utilisation-report-reconciliation-for-report.njk');
      expect(res._getRenderData()).toEqual<UtilisationReportReconciliationForReportViewModel>({
        user: MOCK_TFM_SESSION_USER,
        activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.UTILISATION_REPORTS,
        bank,
        formattedReportPeriod,
        enablePaymentsReceivedSorting: true,
        reportId: '1',
        premiumPayments: expectedPremiumPayments,
        premiumPaymentsFilters,
        paymentDetails: expectedPaymentDetailsViewModel,
        keyingSheet: [],
        utilisationDetails: expectedUtilisationDetails,
        displayMatchSuccessNotification: false,
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
      expect(viewModel.premiumPaymentsTableDataError).toBeDefined();
      expect(viewModel.premiumPaymentsTableDataError?.href).toEqual('#premium-payments-table');
      expect(viewModel.premiumPaymentsTableDataError?.text).toEqual('Select a fee or fees with the same status');
      expect(viewModel.premiumPayments[0].isChecked).toEqual(true);
    });

    it("renders the page with 'displayMatchSuccessNotification' set to true if matchSuccess query param is set to 'true'", async () => {
      // Arrange
      const { req, res } = httpMocks.createMocks({
        session,
        params: {
          reportId,
        },
        query: {
          matchSuccess: 'true',
        },
      });

      jest.mocked(api.getUtilisationReportReconciliationDetailsById).mockResolvedValue(aUtilisationReportReconciliationDetailsResponse());

      // Act
      await getUtilisationReportReconciliationByReportId(req, res);

      // Assert
      expect(res._getRenderView()).toEqual('utilisation-reports/utilisation-report-reconciliation-for-report.njk');
      const viewModel = res._getRenderData() as UtilisationReportReconciliationForReportViewModel;
      expect(viewModel.displayMatchSuccessNotification).toEqual(true);
    });

    it("renders the page with 'displayMatchSuccessNotification' set to false if matchSuccess query param is not set", async () => {
      // Arrange
      const { req, res } = httpMocks.createMocks({
        session,
        params: {
          reportId,
        },
        query: {},
      });

      jest.mocked(api.getUtilisationReportReconciliationDetailsById).mockResolvedValue(aUtilisationReportReconciliationDetailsResponse());

      // Act
      await getUtilisationReportReconciliationByReportId(req, res);

      // Assert
      expect(res._getRenderView()).toEqual('utilisation-reports/utilisation-report-reconciliation-for-report.njk');
      const viewModel = res._getRenderData() as UtilisationReportReconciliationForReportViewModel;
      expect(viewModel.displayMatchSuccessNotification).toEqual(false);
    });

    it("renders the page with 'displayMatchSuccessNotification' set to false if matchSuccess query param is set to a value other than 'true'", async () => {
      // Arrange
      const { req, res } = httpMocks.createMocks({
        session,
        params: {
          reportId,
        },
        query: {
          matchSuccess: 'abcd',
        },
      });

      jest.mocked(api.getUtilisationReportReconciliationDetailsById).mockResolvedValue(aUtilisationReportReconciliationDetailsResponse());

      // Act
      await getUtilisationReportReconciliationByReportId(req, res);

      // Assert
      expect(res._getRenderView()).toEqual('utilisation-reports/utilisation-report-reconciliation-for-report.njk');
      const viewModel = res._getRenderData() as UtilisationReportReconciliationForReportViewModel;
      expect(viewModel.displayMatchSuccessNotification).toEqual(false);
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
      expect(viewModel.enablePaymentsReceivedSorting).toEqual(true);
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
      expect(viewModel.enablePaymentsReceivedSorting).toEqual(false);
    });

    it('sets premium payments filter error when invalid premium payments facility ID query value used', async () => {
      // Arrange
      const premiumPaymentsFacilityIdParam = 'abc';
      const { req, res } = httpMocks.createMocks({
        session,
        params: {
          reportId,
        },
        query: {
          premiumPaymentsFacilityId: premiumPaymentsFacilityIdParam,
        },
        originalUrl: '?premiumPaymentsFacilityId',
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
      expect(viewModel.premiumPaymentsFilterError).toBeDefined();
      expect(viewModel.premiumPaymentsFilterError?.href).toEqual('#premium-payments-facility-id-filter');
      expect(viewModel.premiumPaymentsFilterError?.text).toEqual('Facility ID must be a number');
    });

    it('sets payment details filter error when invalid payment details facility ID query value used', async () => {
      // Arrange
      const paymentDetailsFacilityIdParam = 'abc';
      const { req, res } = httpMocks.createMocks({
        session,
        params: {
          reportId,
        },
        query: {
          paymentDetailsFacilityId: paymentDetailsFacilityIdParam,
        },
        originalUrl: '?paymentDetailsFacilityId',
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

      expect(viewModel.paymentDetails.filterErrors).toBeDefined();

      expect(viewModel.paymentDetails.filterErrors!.errorSummary).toHaveLength(1);
      expect(viewModel.paymentDetails.filterErrors!.errorSummary[0].href).toEqual('#payment-details-facility-id-filter');
      expect(viewModel.paymentDetails.filterErrors!.errorSummary[0].text).toEqual('Facility ID must be blank or contain between 4 and 10 numbers');
    });

    it('checks selected checkboxes when selected fee record ids query param defined', async () => {
      // Arrange
      const selectedFeeRecordIdsQueryParam = '1,2,3';
      const { req, res } = httpMocks.createMocks({
        session,
        params: { reportId },
        query: {
          premiumPaymentsFacilityId,
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
      expect(viewModel.premiumPayments[0].isChecked).toEqual(true);
      expect(viewModel.premiumPayments[1].isChecked).toEqual(true);
      expect(viewModel.premiumPayments[2].isChecked).toEqual(false);
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
