import { RecordCorrectionRequestReason } from '@ukef/dtfs2-common';

export type CreateRecordCorrectionRequestFormValues = {
  reasons?: RecordCorrectionRequestReason[];
  additionalInfo?: string;
};
