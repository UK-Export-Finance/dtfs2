import { Request } from 'express';
import { TFM_DEAL_CANCELLATION_STATUS, TfmDealCancellationWithStatus, DATE_FORMATS, Deal, getUkefDealId } from '@ukef/dtfs2-common';
import { format } from 'date-fns';
import api from '../../api';
import { isDealCancellationEnabled } from './deal-cancellation-enabled.helper';
import { getFlashSuccessMessage } from '../../helpers/get-flash-success-message';

/**
 * Returns deal cancellation message if the deal is scheduled for cancellation
 * @param dealSnapshot - the deal
 * @param userToken - the user token
 * @returns the success message to be shown or null
 */
export const getScheduledCancellationBannerMessage = async ({ dealSnapshot, userToken }: { dealSnapshot: Deal; userToken: string }): Promise<string | null> => {
  const { submissionType, _id: dealId } = dealSnapshot;
  const ukefDealId = getUkefDealId(dealSnapshot);

  const dealCancellationIsEnabled = isDealCancellationEnabled(submissionType);

  if (!dealCancellationIsEnabled) {
    return null;
  }

  const cancellation = (await api.getDealCancellation(dealId.toString(), userToken)) as TfmDealCancellationWithStatus;

  const dealIsScheduledToBeCancelled = cancellation.status === TFM_DEAL_CANCELLATION_STATUS.SCHEDULED && cancellation.effectiveFrom;

  if (!dealIsScheduledToBeCancelled) {
    return null;
  }

  const formattedDate = format(new Date(cancellation.effectiveFrom), DATE_FORMATS.D_MMMM_YYYY);

  return `Deal ${ukefDealId} scheduled for cancellation on ${formattedDate}`;
};

/**
 * Determines if a success message should be shown and returns the highest priority message.
 * @param params - the deal
 * @param params.dealSnapshot - the deal
 * @param params.userToken - the user token
 * @param params.flash - the request flash storage method
 * @returns the success message to be shown or null
 */
export const getDealSuccessBannerMessage = async ({ dealSnapshot, userToken, flash }: { dealSnapshot: Deal; userToken: string; flash: Request['flash'] }) => {
  const scheduledCancellationMessage = await getScheduledCancellationBannerMessage({
    dealSnapshot,
    userToken,
  });
  const flashSuccessMessage = getFlashSuccessMessage(flash);

  return scheduledCancellationMessage || flashSuccessMessage;
};
