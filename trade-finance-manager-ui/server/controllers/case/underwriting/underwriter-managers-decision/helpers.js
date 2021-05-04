import CONSTANTS from '../../../../constants';
import userHelpers from '../../../../helpers/user';

const { userIsInTeam } = userHelpers;

const canUserEdit = (user, dealSubmissionType, dealTfm) => {
  const isManager = userIsInTeam(user, CONSTANTS.TEAMS.UNDERWRITER_MANAGERS);

  const isMIA = dealSubmissionType === CONSTANTS.DEAL.SUBMISSION_TYPE.MIA;

  const hasDecision = (dealTfm.underwriterManagersDecision
    && dealTfm.underwriterManagersDecision.decision);

  if (isManager
    && isMIA
    && !hasDecision) {
    return true;
  }

  return false;
};

export default {
  canUserEdit,
};
