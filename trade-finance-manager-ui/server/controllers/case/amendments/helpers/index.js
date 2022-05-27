const CONSTANTS = require('../../../../constants');
const { userIsInTeam } = require('../../../../helpers/user');

const userCanEditLeadUnderwriter = (user) => userIsInTeam(user, [CONSTANTS.TEAMS.UNDERWRITER_MANAGERS, CONSTANTS.TEAMS.UNDERWRITERS]);

const userCanEditManagersDecision = (user, amendment) => {
  const isManager = userIsInTeam(user, [CONSTANTS.TEAMS.UNDERWRITER_MANAGERS]);
  const hasSubmittedDecision = amendment?.ukefDecision?.submitted;
  if (isManager && !hasSubmittedDecision) {
    return true;
  }
  return false;
};

const userCanEditBankDecision = (user, amendment) => {
  const isPim = userIsInTeam(user, [CONSTANTS.TEAMS.PIM]);
  const hasSubmittedDecision = amendment?.ukefDecision?.submitted && !amendment?.bankDecision?.submitted;
  if (isPim && hasSubmittedDecision) {
    return true;
  }
  return false;
};

module.exports = {
  userCanEditLeadUnderwriter,
  userCanEditManagersDecision,
  userCanEditBankDecision,
};
