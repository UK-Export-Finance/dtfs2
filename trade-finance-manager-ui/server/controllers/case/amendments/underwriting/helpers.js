const CONSTANTS = require('../../../../constants');
const { userIsInTeam } = require('../../../../helpers/user');

const canUserEditLeadUnderwriter = (user) =>
  userIsInTeam(user, [CONSTANTS.TEAMS.UNDERWRITER_MANAGERS]);

const canUserEditManagersDecision = (user, amendment) => {
  const isManager = userIsInTeam(user, [CONSTANTS.TEAMS.UNDERWRITER_MANAGERS]);

  const hasDecision = amendment?.underwriterManagersDecision?.decision;

  if (isManager && !hasDecision) {
    return true;
  }

  return false;
};

const canUserEditBankDecision = (user, amendment) => {
  const isPim = userIsInTeam(user, [CONSTANTS.TEAMS.PIM]);

  const hasDecision = amendment?.underwriterManagersDecision?.decision;

  if (isPim && hasDecision) {
    return true;
  }

  return false;
};

module.exports = {
  canUserEditLeadUnderwriter,
  canUserEditManagersDecision,
  canUserEditBankDecision,
};
