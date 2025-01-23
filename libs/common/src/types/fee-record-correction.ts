import { CurrencyAndAmount } from './currency';
import { RecordCorrectionReason } from './record-correction-reason';
import { FeeRecordStatus } from './utilisation-reports';

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
  status: FeeRecordStatus;
  formattedOldRecords: string;
  formattedCorrectRecords: string;
};
