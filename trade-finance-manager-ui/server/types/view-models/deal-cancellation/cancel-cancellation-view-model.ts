import { BaseViewModel } from '../base-view-model';

export type CancelCancellationViewModel = BaseViewModel & {
  ukefDealId: string;
  previousPage: string;
};
