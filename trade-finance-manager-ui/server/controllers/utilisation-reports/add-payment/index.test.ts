import httpMocks from 'node-mocks-http';
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
            reportedPayment: { amount: 3000, currency: 'USD' },
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
              reportedFee: 'EUR 2,000.00',
              reportedPayment: 'USD 3,000.00',
            },
          ],
        },
      });
    });
  });
});
