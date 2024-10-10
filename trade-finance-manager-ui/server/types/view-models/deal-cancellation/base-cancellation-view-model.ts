import { BaseViewModel } from '../base-view-model';

export type BaseCancellationViewModel = BaseViewModel & {
  ukefDealId: string;
  dealId: string;
  previousPage: string;
};
