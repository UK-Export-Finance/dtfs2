const CONSTANTS = require('../../../../constants');
const { userIsInTeam } = require('../../../../helpers/user');

const userCanEditLeadUnderwriter = (user) => userIsInTeam(user, [CONSTANTS.TEAMS.UNDERWRITER_MANAGERS, CONSTANTS.TEAMS.UNDERWRITERS]);

const userCanEditManagersDecision = (user, amendment) => {
  const isManager = userIsInTeam(user, [CONSTANTS.TEAMS.UNDERWRITER_MANAGERS]);
  const hasDecision = amendment?.underwriterManagersDecision?.decision;
  if (isManager && !hasDecision) {
    return true;
  }
  return false;
};

const userCanEditBankDecision = (user, amendment) => {
  const isPim = userIsInTeam(user, [CONSTANTS.TEAMS.PIM]);
  const hasDecision = amendment?.underwriterManagersDecision?.decision;
  if (isPim && hasDecision) {
    return true;
  }
  return false;
};

module.exports = {
  userCanEditLeadUnderwriter,
  userCanEditManagersDecision,
  userCanEditBankDecision,
};
