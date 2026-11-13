import { BaseViewModel } from '@tfm-ui/types/view-models/base-view-model';

export type CancelCancellationViewModel = BaseViewModel & {
  ukefDealId: string;
  previousPage: string;
};
