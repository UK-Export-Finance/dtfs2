import { BaseViewModel } from '@tfm-ui/types/view-models/base-view-model';

export type BaseCancellationViewModel = BaseViewModel & {
  ukefDealId: string;
  dealId: string;
  previousPage: string;
};
