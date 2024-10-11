import { ErrorSummaryViewModel } from '../error-summary-view-model';
import { BaseCancellationViewModel } from './base-cancellation-view-model';

export type BankRequestErrorsViewModel = {
  summary: ErrorSummaryViewModel[];
  bankRequestDateError: { message: string; fields: string[] };
};

export type BankRequestDateValidationViewModel = {
  errors: BankRequestErrorsViewModel | null;
  bankRequestDate?: Date;
};

export type BankRequestDateViewModel = BaseCancellationViewModel & {
  day?: string;
  month?: string;
  year?: string;
  errors?: BankRequestErrorsViewModel;
};
