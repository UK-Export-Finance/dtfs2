import { FeeRecordViewModelItem } from '../server/types/view-models';

export const aFeeRecordViewModelItem = (): FeeRecordViewModelItem => ({
  id: 1,
  facilityId: '12345678',
  exporter: 'Test exporter',
  reportedFees: 'GBP 100.00',
  reportedPayments: 'GBP 100.00',
});
