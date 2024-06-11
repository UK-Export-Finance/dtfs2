import { FeeRecordPaymentGroupItem } from '../server/api-response-types';

export const aFeeRecordPaymentGroupItem = (): FeeRecordPaymentGroupItem => ({
  feeRecords: [
    {
      id: 1,
      facilityId: '12345678',
      exporter: 'Test exporter',
      reportedFees: {
        currency: 'GBP',
        amount: 100,
      },
      reportedPayments: {
        currency: 'GBP',
        amount: 100,
      },
    },
  ],
  totalReportedPayments: {
    currency: 'GBP',
    amount: 100,
  },
  paymentsReceived: null,
  totalPaymentsReceived: null,
  status: 'TO_DO',
});
