import { RecordCorrectionTransientFormData } from '@ukef/types';
import { DbRequestSource } from '@ukef/sql-db-entities/helpers';

export type CreateFeeRecordCorrectionTransientFormDataParams = {
  userId: string;
  correctionId: number;
  formData: RecordCorrectionTransientFormData;
  requestSource: DbRequestSource;
};
