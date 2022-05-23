const CONSTANTS = require('../../constants');

/**
 * @param {Object} deal
 * @param {Array} userTeam
 * @returns {Boolean}
 * function to show amendment button
 * checks submissionType, tfm status and if PIM user
 */
const showAmendmentButton = (deal, userTeam) => {
  const acceptableSubmissionType = [CONSTANTS.DEAL.SUBMISSION_TYPE.AIN, CONSTANTS.DEAL.SUBMISSION_TYPE.MIN];
  const acceptableUser = CONSTANTS.TEAMS.PIM;
  const acceptableStatus = [CONSTANTS.DEAL.DEAL_STAGE.CONFIRMED];

  if (acceptableSubmissionType.includes(deal.dealSnapshot.submissionType) && userTeam.includes(acceptableUser) && acceptableStatus.includes(deal.tfm.stage)) {
    return true;
  }
  return false;
};

module.exports = { showAmendmentButton };
