import { FeeRecordItem } from '../server/api-response-types';

export const aFeeRecordItem = (): FeeRecordItem => ({
  id: 1,
  facilityId: '12345678',
  exporter: 'Test exporter',
  reportedFees: {
    currency: 'GBP',
    amount: 314.59,
  },
  reportedPayments: {
    currency: 'EUR',
    amount: 100.0,
  },
  totalReportedPayments: {
    currency: 'EUR',
    amount: 100.0,
  },
  paymentsReceived: {
    currency: 'JPY',
    amount: 123.456,
  },
  totalPaymentsReceived: {
    currency: 'JPY',
    amount: 654.321,
  },
  status: 'TO_DO',
});
