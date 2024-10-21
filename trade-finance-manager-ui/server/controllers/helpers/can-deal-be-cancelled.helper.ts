import {
  DEAL_SUBMISSION_TYPE,
  DealSubmissionType,
  isTfmDealCancellationFeatureFlagEnabled,
  TEAM_IDS,
  TFM_DEAL_CANCELLATION_STATUS,
  TfmDealCancellationStatus,
} from '@ukef/dtfs2-common';
import { userIsInTeam } from '../../helpers/user';
import { TfmSessionUser } from '../../types/tfm-session-user';

const { AIN, MIN } = DEAL_SUBMISSION_TYPE;
/**
 * Checks if the deal submission type can be cancelled
 * @param submissionType - the deal submission type
 * @returns true if the deal is AIN or MIN
 */
export const canSubmissionTypeBeCancelled = (submissionType: DealSubmissionType): boolean => {
  return submissionType === AIN || submissionType === MIN;
};

/**
 * Checks if deal cancellation is enabled for a deal and user type
 * @param submissionType - the deal submission type
 * @param user - the session user
 * @param cancellationStatus - the current deal cancellation status if it exists
 * @returns true or false depending on the feature flag, submission type and user type
 */
export const canDealBeCancelled = (submissionType: DealSubmissionType, user: TfmSessionUser, cancellationStatus?: TfmDealCancellationStatus): boolean => {
  const isDealCancellationFeatureFlagEnabled = isTfmDealCancellationFeatureFlagEnabled();

  const isUserAllowedToCancelDeal = userIsInTeam(user, [TEAM_IDS.PIM]);

  const isAcceptableSubmissionType = canSubmissionTypeBeCancelled(submissionType);

  const isDealNotAlreadyCancelled = !(
    cancellationStatus === TFM_DEAL_CANCELLATION_STATUS.COMPLETED || cancellationStatus === TFM_DEAL_CANCELLATION_STATUS.SCHEDULED
  );

  return isDealCancellationFeatureFlagEnabled && isUserAllowedToCancelDeal && isAcceptableSubmissionType && isDealNotAlreadyCancelled;
};
