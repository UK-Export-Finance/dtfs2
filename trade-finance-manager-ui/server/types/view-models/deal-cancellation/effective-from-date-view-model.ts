import { BaseViewModel } from '../base-view-model';
import { ErrorSummaryViewModel } from '../error-summary-view-model';

export type EffectiveFromDateErrorsViewModel = {
  summary: ErrorSummaryViewModel[];
  effectiveFromDateError: { message: string; fields: string[] };
};

export type EffectiveFromDateViewModel = BaseViewModel & {
  ukefDealId: string;
  dealId: string;
  day?: string;
  month?: string;
  year?: string;
  errors?: EffectiveFromDateErrorsViewModel | null;
};
