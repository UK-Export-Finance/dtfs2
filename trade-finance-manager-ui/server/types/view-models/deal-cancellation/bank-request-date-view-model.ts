import { BaseViewModel } from '../base-view-model';
import { ErrorSummaryViewModel } from '../error-summary-view-model';

export type BankRequestDateErrorsViewModel = {
  errorSummary: ErrorSummaryViewModel[];
  bankRequestDateErrorMessage?: string;
};

export type BankRequestDateViewModel = BaseViewModel & {
  ukefDealId: string;
  dealId: string;
  errors?: BankRequestDateErrorsViewModel;
  bankRequestDate?: number;
};
