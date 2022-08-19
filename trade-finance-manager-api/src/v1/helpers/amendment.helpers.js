const api = require('../api');
const sendTfmEmail = require('../controllers/send-tfm-email');
const { UNDERWRITER_MANAGER_DECISIONS } = require('../../constants/amendments');
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
const amendmentEmailEligible = (amendment) =>
  amendment && (amendment?.automaticApprovalEmail || amendment?.ukefDecision?.managersDecisionEmail || amendment?.bankDecision?.banksDecisionEmail
    || amendment?.sendFirstTaskEmail);

const isApprovedWithConditions = (ukefDecision) => {
  const { value, coverEndDate } = ukefDecision;

  return value === AMENDMENT_UW_DECISION.APPROVED_WITH_CONDITIONS || coverEndDate === AMENDMENT_UW_DECISION.APPROVED_WITH_CONDITIONS;
};

// checks if value or coverEndDate are approved without conditions
const isApprovedWithoutConditions = (ukefDecision) => {
  const { value, coverEndDate } = ukefDecision;

  return value === AMENDMENT_UW_DECISION.APPROVED_WITHOUT_CONDITIONS || coverEndDate === AMENDMENT_UW_DECISION.APPROVED_WITHOUT_CONDITIONS;
};

/**
 * Ascertain whether the requested amendment
 * have been declined or not.
 * @param {Object} amendment Amendment object
 * @returns {Boolean} Whether both the amendments decision has been declined by the underwriter.
 */
const amendmentDeclined = (amendment) => {
  const { changeFacilityValue, changeCoverEndDate } = amendment;
  const { value, coverEndDate } = amendment.ukefDecision;
  const { DECLINED } = UNDERWRITER_MANAGER_DECISIONS;

  // Ensure not all of the amendment requests are declined

  // Dual amendment request
  if (changeFacilityValue && changeCoverEndDate) {
    return value === DECLINED && coverEndDate === DECLINED;
  }
  // Single amendment request
  return value === DECLINED || coverEndDate === DECLINED;
};

const sendAutomaticAmendmentEmail = async (amendmentVariables) => {
  const { user, facilityId, amendmentId } = amendmentVariables;
  const templateId = EMAIL_TEMPLATE_IDS.AUTOMATIC_AMENDMENT;
  const emailVariables = automaticAmendmentEmailVariables(amendmentVariables);

  try {
    const emailResponse = await sendTfmEmail(templateId, user.email, emailVariables);
    // if successful, then updates flag to say email has been sent
    if (emailResponse) {
      await api.updateFacilityAmendment(facilityId, amendmentId, { automaticApprovalEmailSent: true });
    }
  } catch (err) {
    console.error('TFM-API error sending email - sendAutomaticAmendmentEmail', { err });
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

  try {
    const emailResponse = await sendTfmEmail(templateId, user.email, emailVariables);
    // if successful, then updates flag to say email has been sent
    if (emailResponse) {
      await managersDecisionUpdateEmailConfirmation(facilityId, amendmentId);
    }
  } catch (err) {
    console.error('TFM-API error sending email - emailApprovedWithWithoutConditions', { err });
  }
};

const emailApprovedWithoutConditions = async (amendmentVariables) => {
  const { user, facilityId, amendmentId } = amendmentVariables;
  const templateId = EMAIL_TEMPLATE_IDS.MANUAL_AMENDMENT_DECISION_APPROVED_WO_CONDITIONS;
  const emailVariables = approvedWithWithoutConditionsDecision(amendmentVariables);

  try {
    const emailResponse = await sendTfmEmail(templateId, user.email, emailVariables);
    // if successful, then updates flag to say email has been sent
    if (emailResponse) {
      await managersDecisionUpdateEmailConfirmation(facilityId, amendmentId);
    }
  } catch (err) {
    console.error('TFM-API error sending email - emailApprovedWithoutConditions', { err });
  }
};

const emailApprovedWithConditionsDeclined = async (amendmentVariables) => {
  const { user, facilityId, amendmentId } = amendmentVariables;
  const templateId = EMAIL_TEMPLATE_IDS.MANUAL_AMENDMENT_DECISION_APPROVED_W_CONDITIONS_DECLINED;
  const emailVariables = approvedWithConditionsDeclinedDecision(amendmentVariables);

  try {
    const emailResponse = await sendTfmEmail(templateId, user.email, emailVariables);
    // if successful, then updates flag to say email has been sent
    if (emailResponse) {
      await managersDecisionUpdateEmailConfirmation(facilityId, amendmentId);
    }
  } catch (err) {
    console.error('TFM-API error sending email - emailApprovedWithConditionsDeclined', { err });
  }
};

const emailApprovedWithoutConditionsDeclined = async (amendmentVariables) => {
  const { user, facilityId, amendmentId } = amendmentVariables;
  const templateId = EMAIL_TEMPLATE_IDS.MANUAL_AMENDMENT_DECISION_APPROVED_WO_CONDITIONS_DECLINED;
  const emailVariables = approvedWithoutConditionsDeclinedDecision(amendmentVariables);

  try {
    const emailResponse = await sendTfmEmail(templateId, user.email, emailVariables);
    // if successful, then updates flag to say email has been sent
    if (emailResponse) {
      await managersDecisionUpdateEmailConfirmation(facilityId, amendmentId);
    }
  } catch (err) {
    console.error('TFM-API error sending email - emailApprovedWithoutConditionsDeclined', { err });
  }
};

const emailDeclined = async (amendmentVariables) => {
  const { user, facilityId, amendmentId } = amendmentVariables;
  const templateId = EMAIL_TEMPLATE_IDS.MANUAL_AMENDMENT_DECISION_DECLINED;
  const emailVariables = declinedDecision(amendmentVariables);

  try {
    const emailResponse = await sendTfmEmail(templateId, user.email, emailVariables);
    // if successful, then updates flag to say email has been sent
    if (emailResponse) {
      await managersDecisionUpdateEmailConfirmation(facilityId, amendmentId);
    }
  } catch (err) {
    console.error('TFM-API error sending email - emailDeclined', { err });
  }
};

const sendManualDecisionAmendmentEmail = async (amendmentVariables) => {
  const { amendment } = amendmentVariables;
  const { ukefDecision } = amendment;

  try {
    // if one is approved with conditions and not declined
    if (isApprovedWithConditions(ukefDecision) && !amendmentDeclined(amendment)) {
      await emailApprovedWithWithoutConditions(amendmentVariables);

      // if only approved without conditions (and not declined or with conditions)
    } else if (isApprovedWithoutConditions(ukefDecision) && !amendmentDeclined(amendment) && !isApprovedWithConditions(ukefDecision)) {
      await emailApprovedWithoutConditions(amendmentVariables);

      // if approved with conditions and declined only
    } else if (isApprovedWithConditions(ukefDecision) && amendmentDeclined(amendment) && !isApprovedWithoutConditions(ukefDecision)) {
      await emailApprovedWithConditionsDeclined(amendmentVariables);

      // if approved without conditions and declined only
    } else if (isApprovedWithoutConditions(ukefDecision) && amendmentDeclined(amendment) && !isApprovedWithConditions(ukefDecision)) {
      await emailApprovedWithoutConditionsDeclined(amendmentVariables);

      // if declined only
    } else if (amendmentDeclined(amendment) && !isApprovedWithConditions(ukefDecision) && !isApprovedWithoutConditions(ukefDecision)) {
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

  try {
    const emailResponse = await sendTfmEmail(templateId, user.email, emailVariables);
    // if successful, then updates flag to say email has been sent
    if (emailResponse) {
      await banksDecisionUpdateEmailConfirmation(facilityId, amendmentId);
    }
  } catch (err) {
    console.error('TFM-API error sending email - emailBankDecision', { err });
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
  const pim = amendment.submittedByPim;
  // Manual amendment verification
  const manual = Boolean(amendment.requireUkefApproval) && Boolean(amendment.bankDecision);

  // Manual amendment
  if (manual) {
    // Bank Decision
    const { submitted, decision } = amendment.bankDecision;
    // Bank has accepted the UW decision
    const proceed = decision === AMENDMENT_BANK_DECISION.PROCEED;

    return hasBeenAmended && completed && pim && submitted && proceed && !amendmentDeclined(amendment);
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
  const { dealId, exporter } = dealSnapshot;

  // dealId in snapshot for gef and details for bss
  const ukefDealId = dealSnapshot.ukefDealId || dealSnapshot.details.ukefDealId;

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
