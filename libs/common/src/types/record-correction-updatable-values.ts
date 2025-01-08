import { RecordCorrectionTransientFormData } from './record-correction-transient-form-data';

export type RecordCorrectionUpdatableFieldValues = Omit<RecordCorrectionTransientFormData, 'additionalComments'>;

export type RecordCorrectionUpdatableFieldValuesKey = keyof RecordCorrectionUpdatableFieldValues;
