import { CurrencyAndAmount } from './currency';
import { RecordCorrectionReason } from './record-correction-reason';

export type FeeRecordCorrectionReviewInformation = {
  correctionId: number;
  feeRecord: {
    exporter: string;
    reportedFees: CurrencyAndAmount;
  };
  reasons: RecordCorrectionReason[];
  errorSummary: string;
  formattedOldValues: string;
  formattedNewValues: string;
  bankCommentary?: string;
};
