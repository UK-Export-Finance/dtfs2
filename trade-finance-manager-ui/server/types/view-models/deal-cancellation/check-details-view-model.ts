import { TfmDealCancellation } from '@ukef/dtfs2-common';
import { BaseViewModel } from '../base-view-model';

export type CheckDetailsViewModel = BaseViewModel & {
  ukefDealId: string;
  dealId: string;
  cancellation: Partial<TfmDealCancellation>;
};
