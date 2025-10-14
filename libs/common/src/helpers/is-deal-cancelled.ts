import { MappedDealTfm } from '../types';
import { TFM_DEAL_STAGE, TFM_DEAL_CANCELLATION_STATUS } from '../constants';

/**
 * Checks if a deal is cancelled.
 * if the deal stage is 'Cancelled' or the cancellation status is 'PENDING', the deal is considered cancelled.
 * will return true if either condition is met.
 * @param tfmDealObject - the TFM deal object to check
 * @returns true if the deal is cancelled, false otherwise
 */
export const isDealCancelled = (tfmDealObject: MappedDealTfm): boolean => {
  const cancelledDeal = tfmDealObject.stage === TFM_DEAL_STAGE.CANCELLED;
  const pendingCancellationDeal = tfmDealObject?.cancellation?.status === TFM_DEAL_CANCELLATION_STATUS.PENDING;

  return cancelledDeal || pendingCancellationDeal;
};
