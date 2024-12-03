const { TEAM_IDS, AMENDMENT_STATUS, DEAL_STATUS } = require('@ukef/dtfs2-common');
const { DECISIONS, DEAL } = require('../../constants');
const { userIsInTeam } = require('../../helpers/user');

/**
 * @param {Object} deal
 * @param {Array} userTeams
 * @returns {boolean}
 * function to show amendment button
 * checks submissionType, tfm stages, deal status, and if PIM user
 */
const showAmendmentButton = (deal, userTeams) => {
  const acceptableSubmissionType = [DEAL.SUBMISSION_TYPE.AIN, DEAL.SUBMISSION_TYPE.MIN];
  const acceptableUserTeamId = TEAM_IDS.PIM;
  const acceptableStages = [DEAL.DEAL_STAGE.CONFIRMED, DEAL.DEAL_STAGE.AMENDMENT_IN_PROGRESS];
  const unacceptableStatuses = [DEAL_STATUS.CANCELLED, DEAL_STATUS.PENDING_CANCELLATION];

  return (
    acceptableSubmissionType.includes(deal.dealSnapshot.submissionType) &&
    userTeams.some((teamId) => teamId === acceptableUserTeamId) &&
    acceptableStages.includes(deal.tfm.stage) &&
    !unacceptableStatuses.includes(deal.status)
  );
};

const userCanEditManagersDecision = (amendment, user) => {
  const isManager = userIsInTeam(user, [TEAM_IDS.UNDERWRITER_MANAGERS]);
  const hasSubmittedDecision = amendment?.ukefDecision?.submitted;
  return !!(isManager && !hasSubmittedDecision);
};

const userCanEditBankDecision = (amendment, user) => {
  const isPim = userIsInTeam(user, [TEAM_IDS.PIM]);
  const hasSubmittedDecision = amendment?.ukefDecision?.submitted && !amendment?.bankDecision?.submitted;
  return !!(isPim && hasSubmittedDecision);
};

/**
 * Ascertain whether the requested amendment
 * have been declined or not.
 * @param {Object} amendment Amendment object
 * @returns {boolean} Whether both the amendments decision has been declined by the underwriter.
 */
const ukefDecisionRejected = (amendment) => {
  const { changeFacilityValue, changeCoverEndDate } = amendment;
  const { value, coverEndDate } = amendment.ukefDecision;
  const { DECLINED } = DECISIONS.UNDERWRITER_MANAGER_DECISIONS;

  // Ensure not all of the amendment requests are declined

  // Dual amendment request
  if (changeFacilityValue && changeCoverEndDate) {
    return value === DECLINED && coverEndDate === DECLINED;
  }
  // Single amendment request
  return value === DECLINED || coverEndDate === DECLINED;
};

/**
 * @param {Object} amendment
 * @param {string} decisionType
 * @returns {boolean}
 * checks if amendment has declined or approved with conditions and returns true if so
 */
const validateUkefDecision = (ukefDecision, decisionType) => ukefDecision?.coverEndDate === decisionType || ukefDecision?.value === decisionType;

const hasAmendmentInProgressDealStage = (amendments) => {
  if (Array.isArray(amendments) && amendments.length) {
    const amendmentsInProgress = amendments.filter(({ status, submittedByPim }) => status === AMENDMENT_STATUS.IN_PROGRESS && submittedByPim);
    const hasAmendmentInProgress = amendmentsInProgress.length > 0;
    if (hasAmendmentInProgress) {
      return true;
    }
  }
  return false;
};

const amendmentsInProgressByDeal = (amendments) => {
  if (Array.isArray(amendments) && amendments.length) {
    return amendments.filter(({ status, submittedByPim }) => status === AMENDMENT_STATUS.IN_PROGRESS && submittedByPim);
  }
  return [];
};

module.exports = {
  showAmendmentButton,
  userCanEditManagersDecision,
  userCanEditBankDecision,
  ukefDecisionRejected,
  validateUkefDecision,
  hasAmendmentInProgressDealStage,
  amendmentsInProgressByDeal,
};
