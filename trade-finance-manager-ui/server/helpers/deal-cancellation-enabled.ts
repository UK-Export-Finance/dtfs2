import { DEAL_SUBMISSION_TYPE, DealSubmissionType, isTfmDealCancellationFeatureFlagEnabled } from '@ukef/dtfs2-common';

export const dealCancellationEnabled = (submissionType: DealSubmissionType): boolean => {
  // TODO: DTFS2-7298: also check that the deal hasn't already been cancelled.
  return isTfmDealCancellationFeatureFlagEnabled() && (submissionType === DEAL_SUBMISSION_TYPE.AIN || submissionType === DEAL_SUBMISSION_TYPE.MIN);
};
