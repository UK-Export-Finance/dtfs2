import { RecordCorrectionReason } from './record-correction-reason';

export type RecordCorrectionRequestTransientFormData = {
  reasons: RecordCorrectionReason[];
  additionalInfo: string;
};
