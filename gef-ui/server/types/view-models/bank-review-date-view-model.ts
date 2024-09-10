import { ViewModelErrors } from './view-model-errors';

export type BankReviewDateViewModel = {
  dealId: string;
  facilityId: string;
  bankReviewDate?: { day: string; month: string; year: string };
  previousPage: string;
  status?: string;
  errors?: ViewModelErrors | null;
};
