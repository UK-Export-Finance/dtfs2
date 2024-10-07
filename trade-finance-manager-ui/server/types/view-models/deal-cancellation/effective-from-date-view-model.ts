import { BaseViewModel } from '../base-view-model';
import { ErrorSummaryViewModel } from '../error-summary-view-model';

export type EffectiveFromDateErrorsViewModel = {
  summary: ErrorSummaryViewModel[];
  effectiveFromDateError: { message: string; fields: string[] };
};

export type EffectiveFromDateValidationViewModel = {
  errors: EffectiveFromDateErrorsViewModel | null;
  effectiveFromDate?: Date;
};

export type EffectiveFromDateViewModel = BaseViewModel & {
  ukefDealId: string;
  dealId: string;
  backUrl: string;
  day?: string;
  month?: string;
  year?: string;
  errors?: EffectiveFromDateErrorsViewModel;
};
