import { TfmDealCancellation } from '@ukef/types/tfm-deal-cancellation';
import { Prettify } from '@ukef/types/types-helper';
import { TfmDealCancellationStatus } from '@ukef/types/tfm';

export type TfmDealCancellationWithStatus = Prettify<
  TfmDealCancellation & {
    status: TfmDealCancellationStatus;
  }
>;
