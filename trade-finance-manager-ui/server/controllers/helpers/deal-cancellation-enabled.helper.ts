import { DEAL_SUBMISSION_TYPE, DealSubmissionType, isTfmDealCancellationFeatureFlagEnabled, TEAM_IDS } from '@ukef/dtfs2-common';
import { userIsInTeam } from '../../helpers/user';
import { TfmSessionUser } from '../../types/tfm-session-user';

/**
 * Checks if the deal submission type can be cancelled
 * @param submissionType - the deal submission type
 * @returns true if the deal is AIN or MIN
 */
export const canSubmissionTypeBeCancelled = (submissionType: DealSubmissionType): boolean => {
  return submissionType === DEAL_SUBMISSION_TYPE.AIN || submissionType === DEAL_SUBMISSION_TYPE.MIN;
};

/**
 * Checks if deal cancellation is enabled for a deal and user type
 * @param submissionType - the deal submission type
 * @param user - the session user
 * @returns true or false depending on the feature flag, submission type and user type
 */
export const isDealCancellationEnabled = (submissionType: DealSubmissionType, user: TfmSessionUser): boolean => {
  // TODO: DTFS2-7298: also check that the deal hasn't already been cancelled.

  const isUserAllowedToCancelDeal = userIsInTeam(user, [TEAM_IDS.PIM]);
  const isDealCancellationFeatureFlagEnabled = isTfmDealCancellationFeatureFlagEnabled();
  const isAcceptableSubmissionType = canSubmissionTypeBeCancelled(submissionType);

  return isUserAllowedToCancelDeal && isDealCancellationFeatureFlagEnabled && isAcceptableSubmissionType;
};
