import { ErrorSummaryViewModel } from '../error-summary-view-model';
import { BaseCancellationViewModel } from './base-cancellation-view-model';

export type EffectiveFromDateErrorsViewModel = {
  summary: ErrorSummaryViewModel[];
  effectiveFromDateError: { message: string; fields: string[] };
};

export type EffectiveFromDateValidationViewModel = {
  errors: EffectiveFromDateErrorsViewModel | null;
  effectiveFromDate?: Date;
};

export type EffectiveFromDateViewModel = BaseCancellationViewModel & {
  day?: string;
  month?: string;
  year?: string;
  errors?: EffectiveFromDateErrorsViewModel;
};
