import { ErrorSummaryViewModel } from '../error-summary-view-model';
import { BaseCancellationViewModel } from './base-cancellation-view-model';

export type ReasonForCancellingErrorsViewModel = {
  errorSummary: ErrorSummaryViewModel[];
  reasonForCancellingErrorMessage?: string;
};

export type ReasonForCancellingViewModel = BaseCancellationViewModel & {
  errors?: ReasonForCancellingErrorsViewModel;
  reasonForCancelling?: string;
};
