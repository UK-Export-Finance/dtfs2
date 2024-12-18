import { GetFeeRecordResponseBody } from '../server/api-response-types';

export const aGetFeeRecordResponseBody = (): GetFeeRecordResponseBody => ({
  id: 456,
  bank: {
    id: '789',
    name: 'Test Bank',
  },
  reportPeriod: {
    start: { month: 1, year: 2024 },
    end: { month: 1, year: 2024 },
  },
  facilityId: '0012345678',
  exporter: 'Sample Company Ltd',
});
