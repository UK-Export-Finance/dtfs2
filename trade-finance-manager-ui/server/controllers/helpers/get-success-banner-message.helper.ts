import { TFM_DEAL_CANCELLATION_STATUS, TfmDealCancellationWithStatus, DATE_FORMATS, Deal, getUkefDealId } from '@ukef/dtfs2-common';
import { format } from 'date-fns';
import api from '../../api';
import { isDealCancellationEnabled } from './deal-cancellation-enabled.helper';

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

  const dealIsScheduledToBeCancelled = cancellation.status === TFM_DEAL_CANCELLATION_STATUS.PENDING;

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
 * @param params.req the express request object
 * @returns the success message to be shown
 */
export const getDealSuccessBannerMessage = async ({
  dealSnapshot,
  userToken,
  flashedSuccessMessage,
}: {
  dealSnapshot: Deal;
  userToken: string;
  flashedSuccessMessage: string;
}): Promise<string | undefined> => {
  const scheduledCancellationMessage = await getScheduledCancellationBannerMessage({
    dealSnapshot,
    userToken,
  });

  return scheduledCancellationMessage || flashedSuccessMessage;
};
