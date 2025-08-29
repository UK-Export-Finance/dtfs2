import { CURRENCY, RECORD_CORRECTION_REASON } from '@ukef/dtfs2-common';
import { GetFeeRecordCorrectionResponseBody } from '../../server/api-response-types';

export const aGetFeeRecordCorrectionResponseBody = (): GetFeeRecordCorrectionResponseBody => ({
  id: 7,
  facilityId: '12345678',
  exporter: 'An exporter',
  reportedFees: {
    currency: CURRENCY.GBP,
    amount: 77,
  },
  reasons: [RECORD_CORRECTION_REASON.OTHER],
  additionalInfo: 'Some additional info',
});
