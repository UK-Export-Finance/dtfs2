import { CurrencyAndAmount } from './currency';
import { RecordCorrectionReason } from './record-correction-reason';

export type RequestedByUser = {
  id: string;
  firstName: string;
  lastName: string;
};

export type PendingCorrection = {
  correctionId: number;
  facilityId: string;
  exporter: string;
  reportedFees: CurrencyAndAmount;
  additionalInfo: string;
  reasons: RecordCorrectionReason[];
};

export type FeeRecordCorrectionSummary = {
  correctionId: number;
  feeRecordId: number;
  exporter: string;
  formattedReasons: string;
  formattedDateSent: string;
  isCompleted: boolean;
  formattedOldRecords: string;
  formattedCorrectRecords: string;
};
