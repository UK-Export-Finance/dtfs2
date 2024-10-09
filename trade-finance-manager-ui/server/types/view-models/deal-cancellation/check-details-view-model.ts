import { BaseViewModel } from '../base-view-model';

export type CheckDetailsViewModel = BaseViewModel & {
  ukefDealId: string;
  dealId: string;
  reason?: string;
  bankRequestDate?: string;
  effectiveFromDate?: string;
};
