const api = require('../api');
const sendTfmEmail = require('../controllers/send-tfm-email');
const {
  AMENDMENT_UW_DECISION,
  AMENDMENT_BANK_DECISION,
  AMENDMENT_STATUS,
} = require('../../constants/deals');
const EMAIL_TEMPLATE_IDS = require('../../constants/email-template-ids');
const { automaticAmendmentEmailVariables } = require('../emails/amendments/automatic-approval-email-variables');
const { generateTaskEmailVariables } = require('./generate-task-email-variables');
const { getFirstTask } = require('./tasks');
const {
  approvedWithWithoutConditionsDecision,
  approvedWithConditionsDeclinedDecision,
  approvedWithoutConditionsDeclinedDecision,
  declinedDecision,
  banksDecisionEmailVariables,
} = require('../emails/amendments/manual-amendment-decision-email-variables');

// checks if amendment exists and if eligible to send email
const amendmentEmailEligible = (amendment) => {
  if (amendment && (amendment?.automaticApprovalEmail || amendment?.ukefDecision?.managersDecisionEmail || amendment?.bankDecision?.banksDecisionEmail
    || amendment?.sendFirstTaskEmail)) {
    return true;
  }
  return false;
};

const isApprovedWithConditions = (ukefDecision) => {
  const { value, coverEndDate } = ukefDecision;

  if (value === AMENDMENT_UW_DECISION.APPROVED_WITH_CONDITIONS || coverEndDate === AMENDMENT_UW_DECISION.APPROVED_WITH_CONDITIONS) {
    return true;
  }
  return false;
};

// checks if any are declined
const isDeclined = (ukefDecision) => {
  const { value, coverEndDate } = ukefDecision;

  if (value === AMENDMENT_UW_DECISION.DECLINED || coverEndDate === AMENDMENT_UW_DECISION.DECLINED) {
    return true;
  }
  return false;
};

// checks if value or coverEndDate are approved without conditions
const isApprovedWithoutConditions = (ukefDecision) => {
  const { value, coverEndDate } = ukefDecision;

  if (value === AMENDMENT_UW_DECISION.APPROVED_WITHOUT_CONDITIONS || coverEndDate === AMENDMENT_UW_DECISION.APPROVED_WITHOUT_CONDITIONS) {
    return true;
  }
  return false;
};

const sendAutomaticAmendmentEmail = async (amendmentVariables) => {
  const { user, facilityId, amendmentId } = amendmentVariables;
  const templateId = EMAIL_TEMPLATE_IDS.AUTOMATIC_AMENDMENT;
  const emailVariables = automaticAmendmentEmailVariables(amendmentVariables);

  const emailResponse = await sendTfmEmail(templateId, user.email, emailVariables);
  // if successful, then updates flag to say email has been sent
  if (emailResponse) {
    await api.updateFacilityAmendment(facilityId, amendmentId, { automaticApprovalEmailSent: true });
  }
};

// updates flag if managers decision email sent so not sent again
const managersDecisionUpdateEmailConfirmation = async (facilityId, amendmentId) => {
  const payload = {
    ukefDecision: {
      managersDecisionEmailSent: true,
    },
  };
  await api.updateFacilityAmendment(facilityId, amendmentId, payload);
};

const emailApprovedWithWithoutConditions = async (amendmentVariables) => {
  const { user, facilityId, amendmentId } = amendmentVariables;
  const templateId = EMAIL_TEMPLATE_IDS.MANUAL_AMENDMENT_DECISION_APPROVED_W_CONDITIONS;
  const emailVariables = approvedWithWithoutConditionsDecision(amendmentVariables);

  const emailResponse = await sendTfmEmail(templateId, user.email, emailVariables);
  // if successful, then updates flag to say email has been sent
  if (emailResponse) {
    await managersDecisionUpdateEmailConfirmation(facilityId, amendmentId);
  }
};

const emailApprovedWithoutConditions = async (amendmentVariables) => {
  const { user, facilityId, amendmentId } = amendmentVariables;
  const templateId = EMAIL_TEMPLATE_IDS.MANUAL_AMENDMENT_DECISION_APPROVED_WO_CONDITIONS;
  const emailVariables = approvedWithWithoutConditionsDecision(amendmentVariables);

  const emailResponse = await sendTfmEmail(templateId, user.email, emailVariables);
  // if successful, then updates flag to say email has been sent
  if (emailResponse) {
    await managersDecisionUpdateEmailConfirmation(facilityId, amendmentId);
  }
};

const emailApprovedWithConditionsDeclined = async (amendmentVariables) => {
  const { user, facilityId, amendmentId } = amendmentVariables;
  const templateId = EMAIL_TEMPLATE_IDS.MANUAL_AMENDMENT_DECISION_APPROVED_W_CONDITIONS_DECLINED;
  const emailVariables = approvedWithConditionsDeclinedDecision(amendmentVariables);

  const emailResponse = await sendTfmEmail(templateId, user.email, emailVariables);
  // if successful, then updates flag to say email has been sent
  if (emailResponse) {
    await managersDecisionUpdateEmailConfirmation(facilityId, amendmentId);
  }
};

const emailApprovedWithoutConditionsDeclined = async (amendmentVariables) => {
  const { user, facilityId, amendmentId } = amendmentVariables;
  const templateId = EMAIL_TEMPLATE_IDS.MANUAL_AMENDMENT_DECISION_APPROVED_WO_CONDITIONS_DECLINED;
  const emailVariables = approvedWithoutConditionsDeclinedDecision(amendmentVariables);

  const emailResponse = await sendTfmEmail(templateId, user.email, emailVariables);
  // if successful, then updates flag to say email has been sent
  if (emailResponse) {
    await managersDecisionUpdateEmailConfirmation(facilityId, amendmentId);
  }
};

const emailDeclined = async (amendmentVariables) => {
  const { user, facilityId, amendmentId } = amendmentVariables;
  const templateId = EMAIL_TEMPLATE_IDS.MANUAL_AMENDMENT_DECISION_DECLINED;
  const emailVariables = declinedDecision(amendmentVariables);

  const emailResponse = await sendTfmEmail(templateId, user.email, emailVariables);
  // if successful, then updates flag to say email has been sent
  if (emailResponse) {
    await managersDecisionUpdateEmailConfirmation(facilityId, amendmentId);
  }
};

const sendManualDecisionAmendmentEmail = async (amendmentVariables) => {
  const { amendment } = amendmentVariables;
  const { ukefDecision } = amendment;

  try {
    // if one is approved with conditions and not declined
    if (isApprovedWithConditions(ukefDecision) && !isDeclined(ukefDecision)) {
      await emailApprovedWithWithoutConditions(amendmentVariables);

      // if only approved without conditions (and not declined or with conditions)
    } else if (isApprovedWithoutConditions(ukefDecision) && !isDeclined(ukefDecision) && !isApprovedWithConditions(ukefDecision)) {
      await emailApprovedWithoutConditions(amendmentVariables);

      // if approved with conditions and declined only
    } else if (isApprovedWithConditions(ukefDecision) && isDeclined(ukefDecision) && !isApprovedWithoutConditions(ukefDecision)) {
      await emailApprovedWithConditionsDeclined(amendmentVariables);

      // if approved without conditions and declined only
    } else if (isApprovedWithoutConditions(ukefDecision) && isDeclined(ukefDecision) && !isApprovedWithConditions(ukefDecision)) {
      await emailApprovedWithoutConditionsDeclined(amendmentVariables);

      // if declined only
    } else if (isDeclined(ukefDecision) && !isApprovedWithConditions(ukefDecision) && !isApprovedWithoutConditions(ukefDecision)) {
      await emailDeclined(amendmentVariables);
    } else {
      console.error('Incorrect ukefDecision passed for manual amendment email');
    }
  } catch (error) {
    console.error('Error sending manual amendment underwriter decision email', { error });
  }
};

// updates flag if managers decision email sent so not sent again
const banksDecisionUpdateEmailConfirmation = async (facilityId, amendmentId) => {
  const payload = {
    bankDecision: {
      banksDecisionEmailSent: true,
    },
  };
  await api.updateFacilityAmendment(facilityId, amendmentId, payload);
};

const emailBankDecision = async (amendmentVariables, templateId) => {
  const { user, facilityId, amendmentId } = amendmentVariables;
  const emailVariables = banksDecisionEmailVariables(amendmentVariables);

  const emailResponse = await sendTfmEmail(templateId, user.email, emailVariables);
  // if successful, then updates flag to say email has been sent
  if (emailResponse) {
    await banksDecisionUpdateEmailConfirmation(facilityId, amendmentId);
  }
};

const sendManualBankDecisionEmail = async (amendmentVariables) => {
  const { amendment } = amendmentVariables;
  const { bankDecision } = amendment;

  const { PROCEED, WITHDRAW } = AMENDMENT_BANK_DECISION;

  try {
    if (bankDecision.decision === PROCEED) {
      await emailBankDecision(amendmentVariables, EMAIL_TEMPLATE_IDS.MANUAL_AMENDMENT_BANK_PROCEED);
    } else if (bankDecision.decision === WITHDRAW) {
      await emailBankDecision(amendmentVariables, EMAIL_TEMPLATE_IDS.MANUAL_AMENDMENT_BANK_WITHDRAW);
    } else {
      console.error('Incorrect bankDecision passed for manual amendment email');
    }
  } catch (error) {
    console.error('Error sending manual amendment bank decision email', { error });
  }
};

/**
 * Evaluated whether facility amendment is eligible
 * for ACBS interaction based on myriads of conditions.
 * This function evaluated across all amendment types.
 * @param {Object} amendment Facility amendments object
 */
const canSendToAcbs = (amendment) => {
  // Ensure at least one of the attribute has been amended
  const hasBeenAmended = amendment.changeCoverEndDate || amendment.changeFacilityValue;
  // Amendment status is marked as `Completed`
  const completed = amendment.status === AMENDMENT_STATUS.COMPLETED;
  // Amendment has been submitted by PIM team
  const pim = Boolean(amendment.submittedByPim);
  // Manual amendment verification
  const manual = Boolean(amendment.requireUkefApproval) && Boolean(amendment.bankDecision);

  // Manual amendment
  if (manual) {
    // Bank Decision
    const { submitted, decision } = amendment.bankDecision;
    // Bank has accepted the UW decision
    const proceed = decision === AMENDMENT_BANK_DECISION.PROCEED;
    // Ensure not all of the amendment requests are declined
    const { value, coverEndDate } = amendment.ukefDecision;
    const declined = value === AMENDMENT_UW_DECISION.DECLINED && coverEndDate === AMENDMENT_UW_DECISION.DECLINED;

    return hasBeenAmended && completed && pim && submitted && proceed && !declined;
  }

  // Automatic amendment
  return hasBeenAmended && completed && pim;
};

// updates flag if managers decision email sent so not sent again
const firstTaskEmailConfirmation = async (facilityId, amendmentId) => {
  const payload = {
    firstTaskEmailSent: true,
  };
  await api.updateFacilityAmendment(facilityId, amendmentId, payload);
};

// sends email for first amendment task when pim submit amendment
const sendFirstTaskEmail = async (taskVariables) => {
  const { amendment, dealSnapshot, facilityId, amendmentId } = taskVariables;
  const { tasks } = amendment;
  const { dealId, exporter, ukefDealId } = dealSnapshot;

  const firstTask = getFirstTask(tasks);
  const urlOrigin = process.env.TFM_URI;
  const templateId = EMAIL_TEMPLATE_IDS.TASK_READY_TO_START;

  try {
    const { team } = firstTask;
    const { email: sendToEmailAddress } = await api.findOneTeam(team.id);

    const emailVariables = generateTaskEmailVariables(urlOrigin, firstTask, dealId, exporter.companyName, ukefDealId);

    const emailResponse = await sendTfmEmail(templateId, sendToEmailAddress, emailVariables);
    // if successful, then updates flag to say email has been sent
    if (emailResponse) {
      await firstTaskEmailConfirmation(facilityId, amendmentId);
    }
  } catch (err) {
    console.error('Error sending first amendment task email', { err });
  }
};

/**
 * Calculates UKEF Exposure for the defined facility
 * based on updated facility amount and original cover percentage.
 * @param {Object} payload Amendment payload
 * @returns {Object} Computed payload with `ukefExposure` property calculated.
 */
const calculateUkefExposure = (payload) => {
  if (payload?.value && payload?.coveredPercentage) {
    return {
      ...payload,
      ukefExposure: payload.value * (payload.coveredPercentage / 100),
    };
  }

  return payload;
};

/**
 * Converts non-ms epoch to ms epoch.
 * @param {Object} payload Amendment payload
 * @returns {Object} Computed payload with EPOCH sm compatible `coverEndDate`.
 */
const formatCoverEndDate = (payload) => {
  if (payload?.coverEndDate) {
    /**
     * TODO: date-fns and moment.js convergence
     * Convert EPOCH to millisecond compatible epoch.
     * date-fns outputs non-ms EPOCH.
     * */
    const epoch = payload.coverEndDate.toString().length > 10
      ? payload.coverEndDate
      : payload.coverEndDate * 1000;

    return {
      ...payload,
      coverEndDate: epoch,
    };
  }
  return payload;
};

module.exports = {
  amendmentEmailEligible,
  sendAutomaticAmendmentEmail,
  sendManualDecisionAmendmentEmail,
  sendManualBankDecisionEmail,
  canSendToAcbs,
  sendFirstTaskEmail,
  calculateUkefExposure,
  formatCoverEndDate,
};
