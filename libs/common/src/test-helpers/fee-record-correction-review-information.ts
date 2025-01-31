import { CURRENCY, RECORD_CORRECTION_REASON } from '../constants';
import { FeeRecordCorrectionReviewInformation } from '../types';

export const aFeeRecordCorrectionReviewInformation = (): FeeRecordCorrectionReviewInformation => ({
  correctionId: 7,
  feeRecord: {
    exporter: 'An exporter',
    reportedFees: {
      currency: 'GBP',
      amount: 1234.56,
    },
  },
  reasons: [RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT, RECORD_CORRECTION_REASON.REPORTED_CURRENCY_INCORRECT, RECORD_CORRECTION_REASON.OTHER],
  errorSummary: 'Some error summary',
  formattedOldValues: `77777777, ${CURRENCY.EUR}`,
  formattedNewValues: `88888888, ${CURRENCY.GBP}`,
  bankCommentary: 'Some bank commentary',
});
