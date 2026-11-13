import { TfmDealCancellation } from '@ukef/dtfs2-common';
import { BaseViewModel } from '@tfm-ui/types/view-models/base-view-model';

export type CheckDetailsViewModel = BaseViewModel & {
  ukefDealId: string;
  dealId: string;
  cancellation: Partial<TfmDealCancellation>;
};
