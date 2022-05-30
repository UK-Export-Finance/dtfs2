const CONSTANTS = require('../../constants');
const { userIsInTeam } = require('../../helpers/user');

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

const userCanEditLeadUnderwriter = (user) => userIsInTeam(user, [CONSTANTS.TEAMS.UNDERWRITER_MANAGERS, CONSTANTS.TEAMS.UNDERWRITERS]);

const userCanEditManagersDecision = (amendment, user) => {
  const isManager = userIsInTeam(user, [CONSTANTS.TEAMS.UNDERWRITER_MANAGERS]);
  const hasSubmittedDecision = amendment?.ukefDecision?.submitted;
  if (isManager && !hasSubmittedDecision) {
    return true;
  }
  return false;
};

const userCanEditBankDecision = (amendment, user) => {
  const isPim = userIsInTeam(user, [CONSTANTS.TEAMS.PIM]);
  const hasSubmittedDecision = amendment?.ukefDecision?.submitted && !amendment?.bankDecision?.submitted;
  if (isPim && hasSubmittedDecision) {
    return true;
  }
  return false;
};

module.exports = {
  showAmendmentButton,
  userCanEditLeadUnderwriter,
  userCanEditManagersDecision,
  userCanEditBankDecision,
};
