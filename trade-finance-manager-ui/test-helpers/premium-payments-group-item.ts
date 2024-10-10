import { PremiumPaymentsGroup } from '../server/api-response-types';
import { aFeeRecord } from './fee-record';

export const aPremiumPaymentsGroup = (): PremiumPaymentsGroup => ({
  feeRecords: [aFeeRecord()],
  totalReportedPayments: {
    currency: 'GBP',
    amount: 100,
  },
  paymentsReceived: null,
  totalPaymentsReceived: null,
  status: 'TO_DO',
});
