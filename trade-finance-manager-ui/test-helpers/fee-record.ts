import { FeeRecord } from '../server/api-response-types';

export const aFeeRecord = (): FeeRecord => ({
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
});
