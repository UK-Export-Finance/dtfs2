import { CurrencyAndAmount, RecordCorrectionOriginalValues, RecordCorrectionReason, RecordCorrectionTransientFormData } from '@ukef/dtfs2-common';

export type GetFeeRecordCorrectionReviewResponseBody = {
  correctionId: number;
  feeRecord: {
    exporter: string;
    reportedFees: CurrencyAndAmount;
  };
  reasons: RecordCorrectionReason[];
  errorSummary: string;
  oldValues: RecordCorrectionOriginalValues;
  newValues: RecordCorrectionTransientFormData;
  bankCommentary?: string;
};
