import httpMocks from 'node-mocks-http';
import { SelectedFeeRecordDetails, SelectedFeeRecordsDetails } from '@ukef/dtfs2-common';
import api from '../../../api';
import { MOCK_TFM_SESSION_USER } from '../../../test-mocks/mock-tfm-session-user';
import { addPayment } from '.';
import { AddPaymentViewModel } from '../../../types/view-models';

jest.mock('../../../api');

console.error = jest.fn();

describe('controllers/utilisation-reports/:id/add-payment', () => {
  const userToken = 'user-token';
  const requestSession = {
    userToken,
    user: MOCK_TFM_SESSION_USER,
  };
  describe('when initial post request with valid body is received from premium payments page', () => {
    const requestBodyForPostFromPremiumPaymentsPage = {
      'feeRecordId-456-reportedPaymentsCurrency-GBP-status-TO_DO': 'on',
    };

    it('should render add payment page', async () => {
      // Arrange
      const { req, res } = httpMocks.createMocks({
        session: requestSession,
        query: { reportId: ['123'] },
        body: requestBodyForPostFromPremiumPaymentsPage,
      });
      jest.mocked(api.getSelectedFeeRecordsDetails).mockResolvedValue({
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
      });

      // Act
      await addPayment(req, res);

      // Assert
      expect(res._getRenderView()).toEqual('utilisation-reports/add-payment.njk');
      expect(res._getRenderData()).toEqual<AddPaymentViewModel>({
        bank: { name: 'Test' },
        formattedReportPeriod: 'February to April 2024',
        reportedFeeDetails: {
          totalReportedPayments: 'JPY 1,000.00',
          feeRecords: [
            {
              feeRecordId: 456,
              facilityId: '000123',
              exporter: 'Export Company',
              reportedFee: { value: 'EUR 2,000.00', dataSortValue: 0 },
              reportedPayments: { value: 'USD 3,000.00', dataSortValue: 0 },
            },
          ],
        },
      });
    });

    it('should set data sort values for reported fee column to order by currency alphabetically then value', async () => {
      // Arrange
      const { req, res } = httpMocks.createMocks({
        session: requestSession,
        query: { reportId: ['123'] },
        body: requestBodyForPostFromPremiumPaymentsPage,
      });
      jest.mocked(api.getSelectedFeeRecordsDetails).mockResolvedValue({
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
      await addPayment(req, res);

      // Assert
      expect(res._getRenderView()).toEqual('utilisation-reports/add-payment.njk');
      expect((res._getRenderData() as AddPaymentViewModel).reportedFeeDetails.feeRecords[0].reportedFee.dataSortValue).toEqual(0);
      expect((res._getRenderData() as AddPaymentViewModel).reportedFeeDetails.feeRecords[1].reportedFee.dataSortValue).toEqual(1);
      expect((res._getRenderData() as AddPaymentViewModel).reportedFeeDetails.feeRecords[2].reportedFee.dataSortValue).toEqual(3);
      expect((res._getRenderData() as AddPaymentViewModel).reportedFeeDetails.feeRecords[3].reportedFee.dataSortValue).toEqual(4);
      expect((res._getRenderData() as AddPaymentViewModel).reportedFeeDetails.feeRecords[4].reportedFee.dataSortValue).toEqual(2);
      expect((res._getRenderData() as AddPaymentViewModel).reportedFeeDetails.feeRecords[5].reportedFee.dataSortValue).toEqual(5);
    });

    it('should set data sort values for reported payments column to order by currency alphabetically then value', async () => {
      // Arrange
      const { req, res } = httpMocks.createMocks({
        session: requestSession,
        query: { reportId: ['123'] },
        body: requestBodyForPostFromPremiumPaymentsPage,
      });
      jest.mocked(api.getSelectedFeeRecordsDetails).mockResolvedValue({
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
      await addPayment(req, res);

      // Assert
      expect(res._getRenderView()).toEqual('utilisation-reports/add-payment.njk');
      expect((res._getRenderData() as AddPaymentViewModel).reportedFeeDetails.feeRecords[0].reportedPayments.dataSortValue).toEqual(0);
      expect((res._getRenderData() as AddPaymentViewModel).reportedFeeDetails.feeRecords[1].reportedPayments.dataSortValue).toEqual(1);
      expect((res._getRenderData() as AddPaymentViewModel).reportedFeeDetails.feeRecords[2].reportedPayments.dataSortValue).toEqual(3);
      expect((res._getRenderData() as AddPaymentViewModel).reportedFeeDetails.feeRecords[3].reportedPayments.dataSortValue).toEqual(4);
      expect((res._getRenderData() as AddPaymentViewModel).reportedFeeDetails.feeRecords[4].reportedPayments.dataSortValue).toEqual(2);
      expect((res._getRenderData() as AddPaymentViewModel).reportedFeeDetails.feeRecords[5].reportedPayments.dataSortValue).toEqual(5);
    });
  });

  function aSelectedFeeRecordsDetails(): SelectedFeeRecordsDetails {
    return {
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
