import httpMocks from 'node-mocks-http';
import { SelectedFeeRecordDetails } from '@ukef/dtfs2-common';
import api from '../../../api';
import { addToAnExistingPayment } from '.';
import { AddToAnExistingPaymentViewModel } from '../../../types/view-models';
import { SelectedFeeRecordsDetailsResponseBody } from '../../../api-response-types';
import { aTfmSessionUser } from '../../../../test-helpers';
import { PremiumPaymentsTableCheckboxSelectionsRequestBody } from '../helpers';
import { getLinkToPremiumPaymentsTab } from './get-link-to-premium-payments-tab';

jest.mock('../../../api');

console.error = jest.fn();

describe('controllers/utilisation-reports/add-to-an-existing-payment', () => {
  const reportId = '123';
  const userToken = 'user-token';
  const requestSession = {
    userToken,
    user: aTfmSessionUser(),
  };

  describe('when navigating from the add payment screen', () => {
    const requestBodyForPostFromAddPaymentPage: PremiumPaymentsTableCheckboxSelectionsRequestBody = {
      'feeRecordIds-456-reportedPaymentsCurrency-USD-status-TO_DO': 'on',
    };

    it('should render the add to an existing payment page', async () => {
      // Arrange
      const { req, res } = httpMocks.createMocks({
        session: requestSession,
        params: { reportId },
        body: requestBodyForPostFromAddPaymentPage,
      });
      jest.mocked(api.getSelectedFeeRecordsDetailsWithAvailablePaymentGroups).mockResolvedValue(aSelectedFeeRecordsDetails());

      // Act
      await addToAnExistingPayment(req, res);

      // Assert
      expect(res._getRenderView()).toEqual('utilisation-reports/add-to-an-existing-payment.njk');
    });

    it("should render the 'problem-with-service' page when available payment groups is undefined", async () => {
      // Arrange
      const { req, res } = httpMocks.createMocks({
        session: requestSession,
        params: { reportId },
        body: requestBodyForPostFromAddPaymentPage,
      });

      jest.mocked(api.getSelectedFeeRecordsDetailsWithAvailablePaymentGroups).mockResolvedValue({
        ...aSelectedFeeRecordsDetails(),
        availablePaymentGroups: undefined,
      });

      // Act
      await addToAnExistingPayment(req, res);

      // Assert
      expect(res._getRenderView()).toBe('_partials/problem-with-service.njk');
    });

    it("should render the 'problem-with-service' page when there are no available payment groups", async () => {
      // Arrange
      const { req, res } = httpMocks.createMocks({
        session: requestSession,
        params: { reportId },
        body: requestBodyForPostFromAddPaymentPage,
      });

      jest.mocked(api.getSelectedFeeRecordsDetailsWithAvailablePaymentGroups).mockResolvedValue({
        ...aSelectedFeeRecordsDetails(),
        availablePaymentGroups: [],
      });

      // Act
      await addToAnExistingPayment(req, res);

      // Assert
      expect(res._getRenderView()).toBe('_partials/problem-with-service.njk');
    });

    it('should fetch and map selected fee record details', async () => {
      // Arrange
      const { req, res } = httpMocks.createMocks({
        session: requestSession,
        params: { reportId },
        body: requestBodyForPostFromAddPaymentPage,
      });
      const selectedFeeRecordDetailsResponse: SelectedFeeRecordsDetailsResponseBody = {
        bank: { name: 'Test' },
        reportPeriod: { start: { month: 2, year: 2024 }, end: { month: 4, year: 2024 } },
        totalReportedPayments: { amount: 1000, currency: 'JPY' },
        feeRecords: [
          {
            id: 456,
            facilityId: '000123',
            exporter: 'Export Company',
            reportedFee: { amount: 2000, currency: 'EUR' },
            reportedPayments: { amount: 3000, currency: 'USD' },
          },
        ],
        payments: [],
        canAddToExistingPayment: true,
        availablePaymentGroups: [
          [
            {
              amount: 1000,
              currency: 'JPY',
              id: 1,
              reference: 'REF001',
            },
          ],
        ],
      };
      jest.mocked(api.getSelectedFeeRecordsDetailsWithAvailablePaymentGroups).mockResolvedValue(selectedFeeRecordDetailsResponse);

      // Act
      await addToAnExistingPayment(req, res);

      // Assert
      expect(api.getSelectedFeeRecordsDetailsWithAvailablePaymentGroups).toHaveBeenCalledWith('123', [456], requestSession.userToken);
      expect(res._getRenderView()).toEqual('utilisation-reports/add-to-an-existing-payment.njk');
      expect((res._getRenderData() as AddToAnExistingPaymentViewModel).bank).toEqual({ name: 'Test' });
      expect((res._getRenderData() as AddToAnExistingPaymentViewModel).formattedReportPeriod).toEqual('February to April 2024');
      expect((res._getRenderData() as AddToAnExistingPaymentViewModel).reportedFeeDetails).toEqual({
        totalReportedPayments: 'JPY 1,000.00',
        feeRecords: [
          {
            id: 456,
            facilityId: '000123',
            exporter: 'Export Company',
            reportedFees: { formattedCurrencyAndAmount: 'EUR 2,000.00', dataSortValue: 0 },
            reportedPayments: { formattedCurrencyAndAmount: 'USD 3,000.00', dataSortValue: 0 },
          },
        ],
      });
    });

    it('should fetch and map available payment groups', async () => {
      // Arrange
      const { req, res } = httpMocks.createMocks({
        session: requestSession,
        params: { reportId },
        body: requestBodyForPostFromAddPaymentPage,
      });
      const selectedFeeRecordDetailsResponse: SelectedFeeRecordsDetailsResponseBody = {
        bank: { name: 'Test' },
        reportPeriod: { start: { month: 2, year: 2024 }, end: { month: 4, year: 2024 } },
        totalReportedPayments: { amount: 1000, currency: 'JPY' },
        feeRecords: [],
        payments: [],
        canAddToExistingPayment: true,
        availablePaymentGroups: [
          [
            {
              amount: 1000,
              currency: 'JPY',
              id: 1,
              reference: 'REF001',
            },
            {
              amount: 2000,
              currency: 'JPY',
              id: 2,
              reference: 'REF002',
            },
          ],
          [
            {
              amount: 3000,
              currency: 'JPY',
              id: 3,
              reference: 'REF003',
            },
          ],
        ],
      };
      jest.mocked(api.getSelectedFeeRecordsDetailsWithAvailablePaymentGroups).mockResolvedValue(selectedFeeRecordDetailsResponse);

      // Act
      await addToAnExistingPayment(req, res);

      // Assert
      expect((res._getRenderData() as AddToAnExistingPaymentViewModel).availablePaymentsHeading).toEqual(
        'Which payment or group of payments do you want to add the reported fees to?',
      );
      expect((res._getRenderData() as AddToAnExistingPaymentViewModel).availablePaymentGroups).toEqual([
        {
          radioId: 'paymentIds-1,2',
          payments: [
            { formattedCurrencyAndAmount: 'JPY 1,000.00', id: '1', reference: 'REF001' },
            { formattedCurrencyAndAmount: 'JPY 2,000.00', id: '2', reference: 'REF002' },
          ],
        },
        { radioId: 'paymentIds-3', payments: [{ formattedCurrencyAndAmount: 'JPY 3,000.00', id: '3', reference: 'REF003' }] },
      ]);
    });

    it('should set the report id', async () => {
      // Arrange
      const { req, res } = httpMocks.createMocks({
        session: requestSession,
        params: { reportId },
        body: requestBodyForPostFromAddPaymentPage,
      });
      jest.mocked(api.getSelectedFeeRecordsDetailsWithAvailablePaymentGroups).mockResolvedValue(aSelectedFeeRecordsDetails());

      // Act
      await addToAnExistingPayment(req, res);

      // Assert
      expect((res._getRenderData() as AddToAnExistingPaymentViewModel).reportId).toEqual('123');
    });

    it('should set the back link href', async () => {
      // Arrange
      const { req, res } = httpMocks.createMocks({
        session: requestSession,
        params: { reportId },
        body: {
          'feeRecordIds-1,22-reportedPaymentsCurrency-USD-status-TO_DO': 'on',
          'feeRecordIds-333-reportedPaymentsCurrency-USD-status-TO_DO': 'on',
        },
      });
      jest.mocked(api.getSelectedFeeRecordsDetailsWithAvailablePaymentGroups).mockResolvedValue({
        ...aSelectedFeeRecordsDetails(),
        feeRecords: [
          {
            ...aSelectedFeeRecordDetails(),
            id: 1,
            reportedFee: { amount: 2000, currency: 'EUR' },
          },
          {
            ...aSelectedFeeRecordDetails(),
            id: 22,
            reportedFee: { amount: 3000, currency: 'EUR' },
          },
          {
            ...aSelectedFeeRecordDetails(),
            id: 333,
            reportedFee: { amount: 100, currency: 'JPY' },
          },
        ],
      });

      // Act
      await addToAnExistingPayment(req, res);

      // Assert
      expect((res._getRenderData() as AddToAnExistingPaymentViewModel).backLinkHref).toEqual(getLinkToPremiumPaymentsTab(reportId, [1, 22, 333]));
    });

    it('should set the selected fee record checkbox ids', async () => {
      // Arrange
      const { req, res } = httpMocks.createMocks({
        session: requestSession,
        params: { reportId },
        body: {
          'feeRecordIds-1,22-reportedPaymentsCurrency-USD-status-TO_DO': 'on',
          'feeRecordIds-333-reportedPaymentsCurrency-USD-status-TO_DO': 'on',
        },
      });
      jest.mocked(api.getSelectedFeeRecordsDetailsWithAvailablePaymentGroups).mockResolvedValue(aSelectedFeeRecordsDetails());

      // Act
      await addToAnExistingPayment(req, res);

      // Assert
      expect((res._getRenderData() as AddToAnExistingPaymentViewModel).selectedFeeRecordCheckboxIds).toEqual([
        'feeRecordIds-1,22-reportedPaymentsCurrency-USD-status-TO_DO',
        'feeRecordIds-333-reportedPaymentsCurrency-USD-status-TO_DO',
      ]);
    });

    it('should set data sort values for reported fee column to order by currency alphabetically then value', async () => {
      // Arrange
      const { req, res } = httpMocks.createMocks({
        session: requestSession,
        params: { reportId },
        body: requestBodyForPostFromAddPaymentPage,
      });
      jest.mocked(api.getSelectedFeeRecordsDetailsWithAvailablePaymentGroups).mockResolvedValue({
        ...aSelectedFeeRecordsDetails(),
        feeRecords: [
          {
            ...aSelectedFeeRecordDetails(),
            id: 1,
            reportedFee: { amount: 2000, currency: 'EUR' },
          },
          {
            ...aSelectedFeeRecordDetails(),
            id: 2,
            reportedFee: { amount: 3000, currency: 'EUR' },
          },
          {
            ...aSelectedFeeRecordDetails(),
            id: 3,
            reportedFee: { amount: 100, currency: 'JPY' },
          },
          {
            ...aSelectedFeeRecordDetails(),
            id: 4,
            reportedFee: { amount: 100.01, currency: 'JPY' },
          },
          {
            ...aSelectedFeeRecordDetails(),
            id: 5,
            reportedFee: { amount: 2000, currency: 'GBP' },
          },
          {
            ...aSelectedFeeRecordDetails(),
            id: 6,
            reportedFee: { amount: 10, currency: 'USD' },
          },
        ],
      });

      // Act
      await addToAnExistingPayment(req, res);

      // Assert
      expect(res._getRenderView()).toEqual('utilisation-reports/add-to-an-existing-payment.njk');
      expect((res._getRenderData() as AddToAnExistingPaymentViewModel).reportedFeeDetails.feeRecords[0].reportedFees.dataSortValue).toEqual(0);
      expect((res._getRenderData() as AddToAnExistingPaymentViewModel).reportedFeeDetails.feeRecords[1].reportedFees.dataSortValue).toEqual(1);
      expect((res._getRenderData() as AddToAnExistingPaymentViewModel).reportedFeeDetails.feeRecords[2].reportedFees.dataSortValue).toEqual(3);
      expect((res._getRenderData() as AddToAnExistingPaymentViewModel).reportedFeeDetails.feeRecords[3].reportedFees.dataSortValue).toEqual(4);
      expect((res._getRenderData() as AddToAnExistingPaymentViewModel).reportedFeeDetails.feeRecords[4].reportedFees.dataSortValue).toEqual(2);
      expect((res._getRenderData() as AddToAnExistingPaymentViewModel).reportedFeeDetails.feeRecords[5].reportedFees.dataSortValue).toEqual(5);
    });

    it('should set data sort values for reported payments column to order by currency alphabetically then value', async () => {
      // Arrange
      const { req, res } = httpMocks.createMocks({
        session: requestSession,
        params: { reportId },
        body: requestBodyForPostFromAddPaymentPage,
      });
      jest.mocked(api.getSelectedFeeRecordsDetailsWithAvailablePaymentGroups).mockResolvedValue({
        ...aSelectedFeeRecordsDetails(),
        feeRecords: [
          {
            ...aSelectedFeeRecordDetails(),
            id: 1,
            reportedPayments: { amount: 2000, currency: 'EUR' },
          },
          {
            ...aSelectedFeeRecordDetails(),
            id: 2,
            reportedPayments: { amount: 3000, currency: 'EUR' },
          },
          {
            ...aSelectedFeeRecordDetails(),
            id: 3,
            reportedPayments: { amount: 100, currency: 'JPY' },
          },
          {
            ...aSelectedFeeRecordDetails(),
            id: 4,
            reportedPayments: { amount: 100.01, currency: 'JPY' },
          },
          {
            ...aSelectedFeeRecordDetails(),
            id: 5,
            reportedPayments: { amount: 2000, currency: 'GBP' },
          },
          {
            ...aSelectedFeeRecordDetails(),
            id: 6,
            reportedPayments: { amount: 10, currency: 'USD' },
          },
        ],
      });

      // Act
      await addToAnExistingPayment(req, res);

      // Assert
      expect(res._getRenderView()).toEqual('utilisation-reports/add-to-an-existing-payment.njk');
      expect((res._getRenderData() as AddToAnExistingPaymentViewModel).reportedFeeDetails.feeRecords[0].reportedPayments.dataSortValue).toEqual(0);
      expect((res._getRenderData() as AddToAnExistingPaymentViewModel).reportedFeeDetails.feeRecords[1].reportedPayments.dataSortValue).toEqual(1);
      expect((res._getRenderData() as AddToAnExistingPaymentViewModel).reportedFeeDetails.feeRecords[2].reportedPayments.dataSortValue).toEqual(3);
      expect((res._getRenderData() as AddToAnExistingPaymentViewModel).reportedFeeDetails.feeRecords[3].reportedPayments.dataSortValue).toEqual(4);
      expect((res._getRenderData() as AddToAnExistingPaymentViewModel).reportedFeeDetails.feeRecords[4].reportedPayments.dataSortValue).toEqual(2);
      expect((res._getRenderData() as AddToAnExistingPaymentViewModel).reportedFeeDetails.feeRecords[5].reportedPayments.dataSortValue).toEqual(5);
    });

    it("should render the 'problem-with-service' page on error", async () => {
      // Arrange
      const { req, res } = httpMocks.createMocks({
        session: requestSession,
        params: { reportId },
        body: requestBodyForPostFromAddPaymentPage,
      });

      jest.mocked(api.getSelectedFeeRecordsDetailsWithAvailablePaymentGroups).mockRejectedValue({
        response: { status: 404 },
      });

      // Act
      await addToAnExistingPayment(req, res);

      // Assert
      expect(res._getRenderView()).toEqual('_partials/problem-with-service.njk');
    });
  });

  function aSelectedFeeRecordsDetails(): SelectedFeeRecordsDetailsResponseBody {
    return {
      bank: { name: 'Test' },
      reportPeriod: { start: { month: 2, year: 2024 }, end: { month: 4, year: 2024 } },
      totalReportedPayments: { amount: 1000, currency: 'JPY' },
      feeRecords: [aSelectedFeeRecordDetails()],
      payments: [],
      canAddToExistingPayment: true,
      availablePaymentGroups: [
        [
          {
            amount: 1000,
            currency: 'JPY',
            id: 1,
            reference: 'REF001',
          },
        ],
        [
          {
            amount: 2000,
            currency: 'GBP',
            id: 2,
            reference: 'REF002',
          },
        ],
      ],
    };
  }

  function aSelectedFeeRecordDetails(): SelectedFeeRecordDetails {
    return {
      id: 456,
      facilityId: '000123',
      exporter: 'Export Company',
      reportedFee: { amount: 2000, currency: 'EUR' },
      reportedPayments: { amount: 3000, currency: 'USD' },
    };
  }
});
