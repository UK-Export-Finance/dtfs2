const CONSTANTS = require('../../constants');
const { userIsInTeam } = require('../../helpers/user');
const api = require('../../api');

const { AMENDMENTS, DECISIONS } = CONSTANTS;

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
 * @param {Object} amendment
 * @returns {Boolean}
 * checks if amendment has coverEndDate or facility value amendment
 * if both or just 1, checks if both or 1 have been declined and returns true
 * else returns false
 */
const ukefDecisionRejected = (amendment) => {
  const { DECLINED } = CONSTANTS.DECISIONS.UNDERWRITER_MANAGER_DECISIONS;
  // checks for boolean variable for which values amendment is changing
  const coverEndDateDecision = amendment.ukefDecision.coverEndDate;
  const facilityValueDecision = amendment.ukefDecision.value;

  // if both then checks both are declined
  if (amendment.changeCoverEndDate && amendment.changeFacilityValue) {
    if (coverEndDateDecision === DECLINED && facilityValueDecision === DECLINED) {
      return true;
    }
  } else if (coverEndDateDecision === DECLINED || facilityValueDecision === DECLINED) {
    // else if only 1, checks either is declined
    return true;
  }
  return false;
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

const hasAmendmentInProgressDealStage = async (dealId) => {
  const { data: amendments } = await api.getAmendmentsByDealId(dealId);

  if (amendments.length) {
    const amendmentsInProgress = amendments.filter(({ status }) => status === AMENDMENTS.AMENDMENT_STATUS.IN_PROGRESS);
    const hasAmendmentInProgress = amendmentsInProgress.length > 0;
    if (hasAmendmentInProgress) {
      return true;
    }
  }
  return false;
};

const latestAmendmentValueAccepted = (amendment) => {
  const { ukefDecision, bankDecision, value, requireUkefApproval } = amendment;
  const { APPROVED_WITH_CONDITIONS: withConditions } = DECISIONS.UNDERWRITER_MANAGER_DECISIONS;
  const { APPROVED_WITHOUT_CONDITIONS: withoutConditions } = DECISIONS.UNDERWRITER_MANAGER_DECISIONS;
  const { PROCEED: proceed } = AMENDMENTS.AMENDMENT_BANK_DECISION;

  const ukefDecisionApproved = ukefDecision?.value === withConditions || ukefDecision?.value === withoutConditions;
  const bankProceed = bankDecision?.decision === proceed;

  if (!requireUkefApproval && value) {
    return true;
  }

  if (value && ukefDecisionApproved && bankProceed) {
    return true;
  }

  return false;
};

const latestAmendmentCoverEndDateAccepted = (amendment) => {
  const { ukefDecision, bankDecision, coverEndDate, requireUkefApproval } = amendment;
  const { APPROVED_WITH_CONDITIONS: withConditions } = DECISIONS.UNDERWRITER_MANAGER_DECISIONS;
  const { APPROVED_WITHOUT_CONDITIONS: withoutConditions } = DECISIONS.UNDERWRITER_MANAGER_DECISIONS;
  const { PROCEED: proceed } = AMENDMENTS.AMENDMENT_BANK_DECISION;

  const ukefDecisionApproved = ukefDecision?.coverEndDate === withConditions || ukefDecision?.coverEndDate === withoutConditions;
  const bankProceed = bankDecision?.decision === proceed;

  if (!requireUkefApproval && coverEndDate) {
    return true;
  }

  if (coverEndDate && ukefDecisionApproved && bankProceed) {
    return true;
  }

  return false;
};

module.exports = {
  showAmendmentButton,
  userCanEditManagersDecision,
  userCanEditBankDecision,
  ukefDecisionRejected,
  validateUkefDecision,
  hasAmendmentInProgressDealStage,
  latestAmendmentValueAccepted,
  latestAmendmentCoverEndDateAccepted,
};
