import { DEAL_SUBMISSION_TYPE } from '@ukef/dtfs2-common';

const { contract, eligibilityCriteria, eligibilityDocumentation } = require('../../e2e/pages');
/**
 * Fills out the eligibility criteria for a deal submission.
 *
 * @param {import('@ukef/dtfs2-common').DealSubmissionType} dealSubmissionType - The type of deal submission.
 * It can be one of the values from DEAL_SUBMISSION_TYPE.
 *
 * @example
 * fillEligibilityCriteria(DEAL_SUBMISSION_TYPE.AIN);
 */
const fillEligibilityCriteria = (dealSubmissionType) => {
  contract.eligibilityCriteriaLink().click();

  for (let index = 11; index < 19; index += 1) {
    eligibilityCriteria.eligibilityCriteriaTrue(index).click();
  }

  if (dealSubmissionType !== DEAL_SUBMISSION_TYPE.AIN) {
    eligibilityCriteria.eligibilityCriteriaFalse(12).click();
  }

  eligibilityCriteria.nextPageButton().click();
  if (dealSubmissionType === DEAL_SUBMISSION_TYPE.MIA) {
    eligibilityDocumentation.questionnaireFileInputUpload().attachFile('test-upload.txt');
  }
};

export { fillEligibilityCriteria };
