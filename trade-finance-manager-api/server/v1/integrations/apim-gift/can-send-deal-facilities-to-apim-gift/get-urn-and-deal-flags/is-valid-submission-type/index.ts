import { DEAL_SUBMISSION_TYPE } from '@ukef/dtfs2-common';

const { AIN, MIN } = DEAL_SUBMISSION_TYPE;

/**
 * Check if the submission type is valid.
 * @param {string | null} submissionType - The submission type of the deal.
 * @returns {boolean} A boolean indicating whether the submission type is valid.
 */
export const isValidSubmissionType = (submissionType: string | null) => submissionType === AIN || submissionType === MIN;
