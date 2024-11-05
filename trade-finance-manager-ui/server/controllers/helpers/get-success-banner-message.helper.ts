import { DealSubmissionType, TFM_DEAL_CANCELLATION_STATUS, TfmDealCancellationWithStatus, DATE_FORMATS } from '@ukef/dtfs2-common';
import { format } from 'date-fns';
import api from '../../api';
import { isDealCancellationEnabled } from './deal-cancellation-enabled.helper';

/**
 * Determines if a success message should be shown and returns the highest priority message.
 * @param submissionType - the deal submission type
 * @param userToken - the user token
 * @param dealId - the deal id
 * @param ukefDealId - the UKEF deal id
 * @returns the success message to be shown or null
 */
export const getSuccessBannerMessage = async ({
  submissionType,
  userToken,
  dealId,
  ukefDealId,
}: {
  submissionType: DealSubmissionType;
  userToken: string;
  dealId: string;
  ukefDealId: string;
}): Promise<string | null> => {
  const dealCancellationIsEnabled = isDealCancellationEnabled(submissionType);

  if (!dealCancellationIsEnabled) {
    return null;
  }

  const cancellation = (await api.getDealCancellation(dealId, userToken)) as TfmDealCancellationWithStatus;

  const dealIsScheduledToBeCancelled = cancellation.status === TFM_DEAL_CANCELLATION_STATUS.SCHEDULED && cancellation.effectiveFrom;

  if (!dealIsScheduledToBeCancelled) {
    return null;
  }

  const formattedDate = format(new Date(cancellation.effectiveFrom), DATE_FORMATS.D_MMMM_YYYY);

  return `Deal ${ukefDealId} scheduled for cancellation on ${formattedDate}`;
};
