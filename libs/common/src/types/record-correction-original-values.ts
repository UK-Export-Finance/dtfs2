import { RecordCorrectionTransientFormData } from './record-correction-transient-form-data';

// TODO FN-3669: Rename type?
export type RecordCorrectionOriginalValues = Omit<RecordCorrectionTransientFormData, 'additionalComments'>;
