import { FeeRecordsToKeyResponseBody } from '../server/api-response-types';

export const aFeeRecordsToKeyResponseBody = (): FeeRecordsToKeyResponseBody => ({
  reportId: 1,
  bank: {
    id: '123',
    name: 'Test bank',
  },
  reportPeriod: {
    start: { month: 1, year: 2024 },
    end: { month: 1, year: 2024 },
  },
  feeRecords: [],
});
