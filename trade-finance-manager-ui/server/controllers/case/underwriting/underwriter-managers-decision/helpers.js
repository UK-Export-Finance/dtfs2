const CONSTANTS = require('#constants');
const { userIsInTeam } = require('#server-helpers/user');

const userCanEditManagersDecision = (user, dealSubmissionType, dealTfm) => {
  const isManager = userIsInTeam(user, [CONSTANTS.TEAMS.UNDERWRITER_MANAGERS]);

  const isMIA = dealSubmissionType === CONSTANTS.DEAL.SUBMISSION_TYPE.MIA;

  const hasDecision = dealTfm.underwriterManagersDecision && dealTfm.underwriterManagersDecision.decision;

  if (isManager && isMIA && !hasDecision) {
    return true;
  }

  return false;
};

module.exports = userCanEditManagersDecision;
