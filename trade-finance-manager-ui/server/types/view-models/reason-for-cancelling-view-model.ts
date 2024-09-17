import { BaseViewModel } from './base-view-model';
import { ErrorSummaryViewModel } from './error-summary-view-model';

export type ReasonForCancellingErrorsViewModel = {
  errorSummary: ErrorSummaryViewModel[];
  reasonForCancellingErrorMessage?: string;
};

export type ReasonForCancellingViewModel = BaseViewModel & {
  ukefDealId: string;
  dealId: string;
  errors?: ReasonForCancellingErrorsViewModel;
  reasonForCancelling?: string;
};
