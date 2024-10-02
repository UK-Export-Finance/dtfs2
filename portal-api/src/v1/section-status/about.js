const submissionDetailsRules = require('../validation/submission-details-rules');
const { FACILITIES } = require('../../constants');

/**
 * Determines the supply contract status based on the submission details.
 * @param {Object} submissionDetails - An object containing details of a submission.
 * @returns {Promise<string>} - The supply contract status.
 */
const aboutSupplyContractStatus = async (submissionDetails) => {
  const { status } = submissionDetails;

  if (status === FACILITIES.DEAL_STATUS.NOT_STARTED) {
    return FACILITIES.DEAL_STATUS.NOT_STARTED;
  }

  const validationErrors = await submissionDetailsRules(submissionDetails);
  const isIncomplete = Object.keys(validationErrors).length > 0;

  return isIncomplete ? FACILITIES.DEAL_STATUS.INCOMPLETE : FACILITIES.DEAL_STATUS.COMPLETED;
};

module.exports = {
  aboutSupplyContractStatus,
};
