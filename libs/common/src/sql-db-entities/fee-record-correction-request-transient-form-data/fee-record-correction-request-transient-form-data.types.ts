import { RecordCorrectionRequestTransientFormData } from '../../types';
import { DbRequestSource } from '../helpers';

export type CreateFeeRecordCorrectionRequestTransientFormDataParams = {
  userId: string;
  feeRecordId: number;
  formData: RecordCorrectionRequestTransientFormData;
  requestSource: DbRequestSource;
};
