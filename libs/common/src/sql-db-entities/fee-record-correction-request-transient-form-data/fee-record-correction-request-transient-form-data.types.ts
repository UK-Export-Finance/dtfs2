import { RecordCorrectionRequestTransientFormData } from '@ukef/types';
import { DbRequestSource } from '@ukef/sql-db-entities/helpers';

export type CreateFeeRecordCorrectionRequestTransientFormDataParams = {
  userId: string;
  feeRecordId: number;
  formData: RecordCorrectionRequestTransientFormData;
  requestSource: DbRequestSource;
};
