const CONSTANTS = require('../../constants');
const { userIsInTeam } = require('../../helpers/user');

const { AMENDMENTS } = CONSTANTS;

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
  const acceptableStatus = [CONSTANTS.DEAL.DEAL_STAGE.CONFIRMED, CONSTANTS.DEAL.DEAL_STAGE.AMENDMENT_IN_PROGRESS];

  if (acceptableSubmissionType.includes(deal.dealSnapshot.submissionType) && userTeam.includes(acceptableUser) && acceptableStatus.includes(deal.tfm.stage)) {
    return true;
  }
  return false;
};

const userCanEditManagersDecision = (amendment, user) => {
  const isManager = userIsInTeam(user, [CONSTANTS.TEAMS.UNDERWRITER_MANAGERS]);
  const hasSubmittedDecision = amendment?.ukefDecision?.submitted;
  return isManager && !hasSubmittedDecision ? true : false;
};

const userCanEditBankDecision = (amendment, user) => {
  const isPim = userIsInTeam(user, [CONSTANTS.TEAMS.PIM]);
  const hasSubmittedDecision = amendment?.ukefDecision?.submitted && !amendment?.bankDecision?.submitted;
  return isPim && hasSubmittedDecision ? true : false;
};

/**
 * Ascertain whether the requested amendment
 * have been declined or not.
 * @param {Object} amendment Amendment object
 * @returns {Boolean} Whether both the amendments decision has been declined by the underwriter.
 */
const ukefDecisionRejected = (amendment) => {
  const { changeFacilityValue, changeCoverEndDate } = amendment;
  const { value, coverEndDate } = amendment.ukefDecision;
  const { UNDERWRITER_MANAGER_DECISIONS } = DECISIONS;

  // Ensure not all of the amendment requests are declined

  // Dual amendment request
  if (changeFacilityValue && changeCoverEndDate) {
    return value === UNDERWRITER_MANAGER_DECISIONS.DECLINED && coverEndDate === UNDERWRITER_MANAGER_DECISIONS.DECLINED;
  }
  // Single amendment request
  return value === UNDERWRITER_MANAGER_DECISIONS.DECLINED || coverEndDate === UNDERWRITER_MANAGER_DECISIONS.DECLINED;
};

/**
 * @param {Object} amendment
 * @param {String} decisionType
 * @returns {Boolean}
 * checks if amendment has declined or approved with conditions and returns true if so
 */
const validateUkefDecision = (ukefDecision, decisionType) => {
  if (ukefDecision?.coverEndDate === decisionType || ukefDecision?.value === decisionType) {
    return true;
  }

  return false;
};

const hasAmendmentInProgressDealStage = async (amendments) => {
  if (amendments.length) {
    const amendmentsInProgress = amendments.filter(({ status, submittedByPim }) => (status === AMENDMENTS.AMENDMENT_STATUS.IN_PROGRESS) && submittedByPim);
    const hasAmendmentInProgress = amendmentsInProgress.length > 0;
    if (hasAmendmentInProgress) {
      return true;
    }
  }
  return false;
};

const amendmentsInProgressByDeal = async (amendments) => {
  if (amendments.length) {
    const amendmentsInProgress = amendments.filter(({ status, submittedByPim }) => (status === AMENDMENTS.AMENDMENT_STATUS.IN_PROGRESS) && submittedByPim);
    return amendmentsInProgress;
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
