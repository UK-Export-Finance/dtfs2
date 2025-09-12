import { CURRENCY, RECORD_CORRECTION_REASON } from '@ukef/dtfs2-common';
import { GetFeeRecordCorrectionResponseBody } from '../../server/v1/api-response-types';

export const aGetFeeRecordCorrectionResponseBody = (): GetFeeRecordCorrectionResponseBody => ({
  id: 7,
  bankId: '123',
  facilityId: '12354678',
  exporter: 'A sample exporter',
  reportedFees: { currency: CURRENCY.GBP, amount: 77 },
  reasons: [RECORD_CORRECTION_REASON.OTHER],
  additionalInfo: 'Some additional information',
});
