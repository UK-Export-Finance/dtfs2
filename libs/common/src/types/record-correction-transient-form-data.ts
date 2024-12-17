import { RecordCorrectionReason } from './record-correction-reason';

export type RecordCorrectionTransientFormData = {
  reasons: RecordCorrectionReason[];
  additionalInfo: string;
};
