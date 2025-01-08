import { CurrencyAndAmount } from './currency';
import { RecordCorrectionUpdatableFieldValues } from './record-correction-updatable-values';
import { RecordCorrectionReason } from './record-correction-reason';

export type FeeRecordCorrectionReviewInformation = {
  correctionId: number;
  feeRecord: {
    exporter: string;
    reportedFees: CurrencyAndAmount;
  };
  reasons: RecordCorrectionReason[];
  errorSummary: string;
  oldValues: RecordCorrectionUpdatableFieldValues;
  newValues: RecordCorrectionUpdatableFieldValues;
  bankCommentary?: string;
};
