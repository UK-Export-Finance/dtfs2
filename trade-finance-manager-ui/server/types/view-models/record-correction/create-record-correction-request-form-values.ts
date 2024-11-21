export type CreateRecordCorrectionRequestFormValues = {
  reasons?: string | string[]; // TODO FN-3575: Can we transform these to an array of type correction reason?
  additionalInfo?: string;
};
