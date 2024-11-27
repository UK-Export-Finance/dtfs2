import { RecordCorrectionTransientFormData } from '../../types';
import { DbRequestSource } from '../helpers';

export type CreateFeeRecordCorrectionTransientFormDataParams = {
  userId: string;
  feeRecordId: number;
  formData: RecordCorrectionTransientFormData;
  requestSource: DbRequestSource;
};
