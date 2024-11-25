import { ErrorSummaryViewModel } from '../error-summary-view-model';

export type CreateRecordCorrectionRequestErrorsViewModel = {
  reasonsErrorMessage?: string;
  additionalInfoErrorMessage?: string;
  errorSummary: ErrorSummaryViewModel[];
};
