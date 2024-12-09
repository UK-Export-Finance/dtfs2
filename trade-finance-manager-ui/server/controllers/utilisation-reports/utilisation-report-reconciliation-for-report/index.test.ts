import httpMocks from 'node-mocks-http';
import { SessionData } from 'express-session';
import { CURRENCY, FEE_RECORD_STATUS, FeeRecordUtilisation, isFeeRecordCorrectionFeatureFlagEnabled } from '@ukef/dtfs2-common';
import api from '../../../api';
import { getUtilisationReportReconciliationByReportId } from '.';
import { MOCK_TFM_SESSION_USER } from '../../../test-mocks/mock-tfm-session-user';
import { PRIMARY_NAVIGATION_KEYS } from '../../../constants';
import { aPremiumPaymentsGroup, aUtilisationReportReconciliationDetailsResponse, aPayment, aFeeRecord, aPaymentDetails } from '../../../../test-helpers';
import { PaymentDetails, PremiumPaymentsGroup, UtilisationReportReconciliationDetailsResponseBody } from '../../../api-response-types';
import {
  PremiumPaymentsViewModelItem,
  PaymentDetailsViewModel,
  UtilisationReportReconciliationForReportViewModel,
  UtilisationDetailsViewModel,
  PremiumPaymentsViewModel,
} from '../../../types/view-models';
import { mapPaymentDetailsFiltersToViewModel } from '../helpers';
import { mapToSelectedPaymentDetailsFiltersViewModel } from './map-to-selected-payment-details-filters-view-model';
import { ADD_PAYMENT_ERROR_KEY, GENERATE_KEYING_DATA_ERROR_KEY } from '../../../constants/premium-payment-tab-error-keys';
import { PREMIUM_PAYMENTS_TABLE_ERROR_HREF } from '../../../constants/premium-payments-table-error-href';

jest.mock('../../../api');
jest.mock('../../../helpers/date');

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock('@ukef/dtfs2-common', () => ({
  ...jest.requireActual('@ukef/dtfs2-common'),
  isFeeRecordCorrectionFeatureFlagEnabled: jest.fn().mockReturnValue(true),
}));

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
      const premiumPaymentsGroups: PremiumPaymentsGroup[] = [
        {
          feeRecords: [
            {
              id: 1,
              facilityId: '12345678',
              exporter: 'Test exporter',
              reportedFees: { currency: CURRENCY.GBP, amount: 100 },
              reportedPayments: { currency: CURRENCY.GBP, amount: 100 },
            },
          ],
          totalReportedPayments: { currency: CURRENCY.GBP, amount: 100 },
          paymentsReceived: [{ id: 1, currency: CURRENCY.GBP, amount: 100, dateReceived: new Date('2024-01-01').toISOString() }],
          totalPaymentsReceived: { currency: CURRENCY.GBP, amount: 100 },
          status: FEE_RECORD_STATUS.MATCH,
        },
      ];
      const paymentDetailsGroups: PaymentDetails[] = [
        {
          feeRecords: [
            {
              id: 1,
              facilityId: '12345678',
              exporter: 'Test exporter',
              reportedFees: { currency: CURRENCY.GBP, amount: 100 },
              reportedPayments: { currency: CURRENCY.GBP, amount: 100 },
            },
          ],
          payment: { id: 1, currency: CURRENCY.GBP, amount: 100, dateReceived: new Date('2024-01-01').toISOString() },
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
        premiumPayments: premiumPaymentsGroups,
        paymentDetails: paymentDetailsGroups,
        utilisationDetails,
      };
      const formattedReportPeriod = 'January 2024';

      const expectedPremiumPaymentsPayments: PremiumPaymentsViewModelItem[] = [
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
          displayStatus: 'Match',
          isSelectable: false,
          checkboxId: 'feeRecordIds-1-reportedPaymentsCurrency-GBP-status-MATCH',
          isChecked: false,
          checkboxAriaLabel: 'Select 12345678',
        },
      ];

      const premiumPaymentsFilters = {
        facilityId: premiumPaymentsFacilityId,
      };

      const expectedPremiumPayments: PremiumPaymentsViewModel = {
        payments: expectedPremiumPaymentsPayments,
        enablePaymentsReceivedSorting: true,
        showMatchSuccessNotification: false,
        filters: premiumPaymentsFilters,
        hasSelectableRows: false,
      };

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
        downloadUrl: `/utilisation-reports/${reportId}/download`,
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
            status: FEE_RECORD_STATUS.MATCH,
            reconciledBy: '-',
            dateReconciled: { formattedDateReconciled: '-', dataSortValue: 0 },
          },
        ],
        filters: mapPaymentDetailsFiltersToViewModel(paymentDetailsFilters),
        filterErrors: {
          errorSummary: [],
        },
        selectedFilters: mapToSelectedPaymentDetailsFiltersViewModel(paymentDetailsFilters, reportId),
        isFilterActive: true,
      };

      jest.mocked(api.getUtilisationReportReconciliationDetailsById).mockResolvedValue(utilisationReportReconciliationDetails);
      jest.mocked(isFeeRecordCorrectionFeatureFlagEnabled).mockReturnValue(true);

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
        reportId: '1',
        premiumPayments: expectedPremiumPayments,
        paymentDetails: expectedPaymentDetailsViewModel,
        keyingSheet: [],
        utilisationDetails: expectedUtilisationDetails,
        isFeeRecordCorrectionFeatureFlagEnabled: true,
      });
    });

    it('should set the add payment error to contain passed in session data and checks selected checkboxes', async () => {
      // Arrange
      const sessionData: Partial<SessionData> = {
        addPaymentErrorKey: ADD_PAYMENT_ERROR_KEY.DIFFERENT_STATUSES,
        checkedCheckboxIds: {
          'feeRecordIds-1-reportedPaymentsCurrency-GBP-status-TO_DO': true,
        },
      };
      const { req, res } = getHttpMocksWithSessionData(sessionData);

      const premiumPaymentsGroups = [aPremiumPaymentsGroup()];
      const paymentDetailsGroups = [aPaymentDetails()];

      const utilisationReportReconciliationDetails: UtilisationReportReconciliationDetailsResponseBody = {
        ...aUtilisationReportReconciliationDetailsResponse(),
        premiumPayments: premiumPaymentsGroups,
        paymentDetails: paymentDetailsGroups,
      };

      jest.mocked(api.getUtilisationReportReconciliationDetailsById).mockResolvedValue(utilisationReportReconciliationDetails);

      // Act
      await getUtilisationReportReconciliationByReportId(req, res);

      // Assert
      expect(res._getRenderView()).toEqual('utilisation-reports/utilisation-report-reconciliation-for-report.njk');
      const viewModel = res._getRenderData() as UtilisationReportReconciliationForReportViewModel;
      expect(viewModel.premiumPayments.tableDataError).toBeDefined();
      expect(viewModel.premiumPayments.tableDataError?.href).toEqual(PREMIUM_PAYMENTS_TABLE_ERROR_HREF);
      expect(viewModel.premiumPayments.tableDataError?.text).toEqual('Select a fee or fees with the same status');
      expect(viewModel.premiumPayments.payments[0].isChecked).toEqual(true);
    });

    describe('when the fee record correction feature flag is enabled', () => {
      beforeEach(() => {
        jest.mocked(isFeeRecordCorrectionFeatureFlagEnabled).mockReturnValue(true);
      });

      it("renders the page with 'isFeeRecordCorrectionFeatureFlagEnabled' set to true if the feature flag is enabled", async () => {
        // Arrange
        const { req, res } = httpMocks.createMocks({
          session,
          params: {
            reportId,
          },
        });

        jest.mocked(api.getUtilisationReportReconciliationDetailsById).mockResolvedValue(aUtilisationReportReconciliationDetailsResponse());

        // Act
        await getUtilisationReportReconciliationByReportId(req, res);

        // Assert
        expect(res._getRenderView()).toEqual('utilisation-reports/utilisation-report-reconciliation-for-report.njk');
        const viewModel = res._getRenderData() as UtilisationReportReconciliationForReportViewModel;
        expect(viewModel.isFeeRecordCorrectionFeatureFlagEnabled).toEqual(true);
      });
    });

    describe('when the fee record correction feature flag is not enabled', () => {
      beforeEach(() => {
        jest.mocked(isFeeRecordCorrectionFeatureFlagEnabled).mockReturnValue(false);
      });

      it("renders the page with 'isFeeRecordCorrectionFeatureFlagEnabled' set to false", async () => {
        // Arrange
        const { req, res } = httpMocks.createMocks({
          session,
          params: {
            reportId,
          },
        });

        jest.mocked(api.getUtilisationReportReconciliationDetailsById).mockResolvedValue(aUtilisationReportReconciliationDetailsResponse());

        // Act
        await getUtilisationReportReconciliationByReportId(req, res);

        // Assert
        expect(res._getRenderView()).toEqual('utilisation-reports/utilisation-report-reconciliation-for-report.njk');
        const viewModel = res._getRenderData() as UtilisationReportReconciliationForReportViewModel;
        expect(viewModel.isFeeRecordCorrectionFeatureFlagEnabled).toEqual(false);
      });
    });

    it("renders the page with 'showMatchSuccessNotification' set to true if matchSuccess query param is set to 'true'", async () => {
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
      expect(viewModel.premiumPayments.showMatchSuccessNotification).toEqual(true);
    });

    it("renders the page with 'showMatchSuccessNotification' set to false if matchSuccess query param is not set", async () => {
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
      expect(viewModel.premiumPayments.showMatchSuccessNotification).toEqual(false);
    });

    it("renders the page with 'showMatchSuccessNotification' set to false if matchSuccess query param is set to a value other than 'true'", async () => {
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
      expect(viewModel.premiumPayments.showMatchSuccessNotification).toEqual(false);
    });

    it("renders the page with 'enablePaymentsReceivedSorting' set to true if at least one fee record has a non-null 'paymentsReceived'", async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      const premiumPaymentsGroups: PremiumPaymentsGroup[] = [
        aPremiumPaymentsGroupWithoutReceivedPayments(),
        {
          ...aPremiumPaymentsGroup(),
          paymentsReceived: [{ ...aPayment(), id: 1, currency: CURRENCY.GBP, amount: 100 }],
          totalPaymentsReceived: { currency: CURRENCY.GBP, amount: 100 },
        },
      ];
      const paymentDetailsGroups = [aPaymentDetails()];

      const utilisationReportReconciliationDetails: UtilisationReportReconciliationDetailsResponseBody = {
        ...aUtilisationReportReconciliationDetailsResponse(),
        premiumPayments: premiumPaymentsGroups,
        paymentDetails: paymentDetailsGroups,
      };

      jest.mocked(api.getUtilisationReportReconciliationDetailsById).mockResolvedValue(utilisationReportReconciliationDetails);

      // Act
      await getUtilisationReportReconciliationByReportId(req, res);

      // Assert
      expect(res._getRenderView()).toEqual('utilisation-reports/utilisation-report-reconciliation-for-report.njk');
      const viewModel = res._getRenderData() as UtilisationReportReconciliationForReportViewModel;
      expect(viewModel.premiumPayments.enablePaymentsReceivedSorting).toEqual(true);
    });

    it("renders the page with 'enablePaymentsReceivedSorting' set to false if all fee records have null 'paymentsReceived'", async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      const premiumPaymentsGroups = [aPremiumPaymentsGroupWithoutReceivedPayments(), aPremiumPaymentsGroupWithoutReceivedPayments()];
      const utilisationReportReconciliationDetails: UtilisationReportReconciliationDetailsResponseBody = {
        ...aUtilisationReportReconciliationDetailsResponse(),
        premiumPayments: premiumPaymentsGroups,
        paymentDetails: [],
      };

      jest.mocked(api.getUtilisationReportReconciliationDetailsById).mockResolvedValue(utilisationReportReconciliationDetails);

      // Act
      await getUtilisationReportReconciliationByReportId(req, res);

      // Assert
      expect(res._getRenderView()).toEqual('utilisation-reports/utilisation-report-reconciliation-for-report.njk');
      const viewModel = res._getRenderData() as UtilisationReportReconciliationForReportViewModel;
      expect(viewModel.premiumPayments.enablePaymentsReceivedSorting).toEqual(false);
    });

    it('should set the premium payments filter error when invalid premium payments facility ID query value used', async () => {
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

      const premiumPaymentsGroups = [aPremiumPaymentsGroupWithoutReceivedPayments(), aPremiumPaymentsGroupWithoutReceivedPayments()];
      const utilisationReportReconciliationDetails: UtilisationReportReconciliationDetailsResponseBody = {
        ...aUtilisationReportReconciliationDetailsResponse(),
        premiumPayments: premiumPaymentsGroups,
        paymentDetails: [],
      };

      jest.mocked(api.getUtilisationReportReconciliationDetailsById).mockResolvedValue(utilisationReportReconciliationDetails);

      // Act
      await getUtilisationReportReconciliationByReportId(req, res);

      // Assert
      expect(res._getRenderView()).toEqual('utilisation-reports/utilisation-report-reconciliation-for-report.njk');
      const viewModel = res._getRenderData() as UtilisationReportReconciliationForReportViewModel;
      expect(viewModel.premiumPayments.filterError).toBeDefined();
      expect(viewModel.premiumPayments.filterError?.href).toEqual('#premium-payments-facility-id-filter');
      expect(viewModel.premiumPayments.filterError?.text).toEqual('Facility ID must be a number');
    });

    it('should set the payment details filter error when invalid payment details facility ID query value used', async () => {
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

      const premiumPaymentsGroups = [aPremiumPaymentsGroupWithoutReceivedPayments(), aPremiumPaymentsGroupWithoutReceivedPayments()];
      const utilisationReportReconciliationDetails: UtilisationReportReconciliationDetailsResponseBody = {
        ...aUtilisationReportReconciliationDetailsResponse(),
        premiumPayments: premiumPaymentsGroups,
        paymentDetails: [],
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

    it('should check the selected checkboxes when selected fee record ids query param defined', async () => {
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

      const premiumPaymentsGroups = [
        {
          ...aPremiumPaymentsGroup(),
          feeRecords: [
            { ...aFeeRecord(), id: 1 },
            { ...aFeeRecord(), id: 2 },
          ],
        },
        {
          ...aPremiumPaymentsGroup(),
          feeRecords: [{ ...aFeeRecord(), id: 3 }],
        },
        {
          ...aPremiumPaymentsGroup(),
          feeRecords: [{ ...aFeeRecord(), id: 4 }],
        },
      ];
      const utilisationReportReconciliationDetails: UtilisationReportReconciliationDetailsResponseBody = {
        ...aUtilisationReportReconciliationDetailsResponse(),
        premiumPayments: premiumPaymentsGroups,
        paymentDetails: [],
      };

      jest.mocked(api.getUtilisationReportReconciliationDetailsById).mockResolvedValue(utilisationReportReconciliationDetails);

      // Act
      await getUtilisationReportReconciliationByReportId(req, res);

      // Assert
      const viewModel = res._getRenderData() as UtilisationReportReconciliationForReportViewModel;
      expect(viewModel.premiumPayments.payments[0].isChecked).toEqual(true);
      expect(viewModel.premiumPayments.payments[1].isChecked).toEqual(true);
      expect(viewModel.premiumPayments.payments[2].isChecked).toEqual(false);
    });

    it('should clear the redirect session data', async () => {
      // Arrange
      const sessionData: Partial<SessionData> = {
        addPaymentErrorKey: ADD_PAYMENT_ERROR_KEY.NO_FEE_RECORDS_SELECTED,
        checkedCheckboxIds: {
          'feeRecordIds-1-reportedPaymentsCurrency-GBP-status-TO_DO': true,
        },
        generateKeyingDataErrorKey: GENERATE_KEYING_DATA_ERROR_KEY.NO_MATCHING_FEE_RECORDS,
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

    function aPremiumPaymentsGroupWithoutReceivedPayments(): PremiumPaymentsGroup {
      return {
        ...aPremiumPaymentsGroup(),
        paymentsReceived: null,
        totalPaymentsReceived: null,
      };
    }
  });
});
