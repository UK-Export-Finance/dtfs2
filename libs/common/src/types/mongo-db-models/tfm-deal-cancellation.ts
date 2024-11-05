import { TfmDealCancellation } from '../tfm-deal-cancellation';
import { Prettify } from '../types-helper';
import { TfmDealCancellationStatus } from '../tfm';

export type TfmDealCancellationWithStatus = Prettify<
  TfmDealCancellation & {
    status: TfmDealCancellationStatus;
  }
>;
