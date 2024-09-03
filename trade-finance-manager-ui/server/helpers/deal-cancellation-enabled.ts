import { DEAL_SUBMISSION_TYPE, dealSubmissionType } from '@ukef/dtfs2-common';

export const dealCancellationEnabled = (dealSubmissionType: dealSubmissionType): boolean => {
  return dealSubmissionType === DEAL_SUBMISSION_TYPE.AIN || dealSubmissionType === DEAL_SUBMISSION_TYPE.MIN;
};
