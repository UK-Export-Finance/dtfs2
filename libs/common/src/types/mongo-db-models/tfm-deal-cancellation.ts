import { TFM_DEAL_CANCELLATION_STATUS } from '../../constants';
import { TfmDealCancellationWithoutStatus } from '../deal-cancellation';
import { ValuesOf } from '../types-helper';

export type TfmDealCancellationWithStatus = TfmDealCancellationWithoutStatus & {
  status: ValuesOf<typeof TFM_DEAL_CANCELLATION_STATUS>;
};
