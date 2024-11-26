import { RecordCorrectionTransientFormData } from '../../types';
import { DbRequestSource } from '../helpers';

export type CreateFeeRecordCorrectionTransientFormDataParams = {
  userId: string;
  formData: RecordCorrectionTransientFormData;
  requestSource: DbRequestSource;
};
