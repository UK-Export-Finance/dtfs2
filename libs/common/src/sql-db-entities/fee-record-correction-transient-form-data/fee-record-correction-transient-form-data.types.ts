import { RecordCorrectionTransientFormData } from '../../types';
import { DbRequestSource } from '../helpers';

export type CreateFeeRecordCorrectionTransientFormDataParams = {
  userId: string;
  correctionId: number;
  formData: RecordCorrectionTransientFormData;
  requestSource: DbRequestSource;
};
