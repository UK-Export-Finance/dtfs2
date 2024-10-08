import { BaseViewModel } from '../base-view-model';
import { ErrorSummaryViewModel } from '../error-summary-view-model';

export type BankRequestErrorsViewModel = {
  summary: ErrorSummaryViewModel[];
  bankRequestDateError: { message: string; fields: string[] };
};

export type BankRequestDateValidationViewModel = {
  errors: BankRequestErrorsViewModel | null;
  bankRequestDate?: Date;
};

export type BankRequestDateViewModel = BaseViewModel & {
  ukefDealId: string;
  dealId: string;
  previousPage: string;
  day?: string;
  month?: string;
  year?: string;
  errors?: BankRequestErrorsViewModel;
};
