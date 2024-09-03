import { DEAL_SUBMISSION_TYPE, dealSubmissionType, isTfmDealCancellationFeatureFlagEnabled } from '@ukef/dtfs2-common';

export const dealCancellationEnabled = (submissionType: dealSubmissionType): boolean => {
  return isTfmDealCancellationFeatureFlagEnabled() && (submissionType === DEAL_SUBMISSION_TYPE.AIN || submissionType === DEAL_SUBMISSION_TYPE.MIN);
};
