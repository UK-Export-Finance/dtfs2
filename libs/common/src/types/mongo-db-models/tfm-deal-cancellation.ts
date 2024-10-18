import { TFM_DEAL_CANCELLATION_STATUS } from '../../constants';
import { TfmDealCancellation } from '../tfm-deal-cancellation';
import { Prettify, ValuesOf } from '../types-helper';

export type TfmDealCancellationWithStatus = Prettify<
  TfmDealCancellation & {
    status: ValuesOf<typeof TFM_DEAL_CANCELLATION_STATUS>;
  }
>;
