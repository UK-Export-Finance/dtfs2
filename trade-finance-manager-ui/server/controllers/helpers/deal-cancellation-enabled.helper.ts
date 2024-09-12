import { DEAL_SUBMISSION_TYPE, DealSubmissionType, isTfmDealCancellationFeatureFlagEnabled, TEAM_IDS } from '@ukef/dtfs2-common';
import { userIsInTeam } from '../../helpers/user';
import { TfmSessionUser } from '../../types/tfm-session-user';

export const dealCancellationEnabled = (submissionType: DealSubmissionType, user: TfmSessionUser): boolean => {
  // TODO: DTFS2-7298: also check that the deal hasn't already been cancelled.

  const userAllowedToCancelDeal = userIsInTeam(user, [TEAM_IDS.PIM]);
  const dealCancellationFeatureFlagEnabled = isTfmDealCancellationFeatureFlagEnabled();
  const acceptableSubmissionType = submissionType === DEAL_SUBMISSION_TYPE.AIN || submissionType === DEAL_SUBMISSION_TYPE.MIN;

  return userAllowedToCancelDeal && dealCancellationFeatureFlagEnabled && acceptableSubmissionType;
};
