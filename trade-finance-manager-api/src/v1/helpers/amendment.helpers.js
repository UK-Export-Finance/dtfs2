const api = require('../api');
const sendTfmEmail = require('../controllers/send-tfm-email');
const { AMENDMENT_UW_DECISION, AMENDMENT_BANK_DECISION } = require('../../constants/deals');
const EMAIL_TEMPLATE_IDS = require('../../constants/email-template-ids');
const { automaticAmendmentEmailVariables } = require('../emails/amendments/automatic-approval-email-variables');
const { approvedWithConditionsDecision,
  approvedWithoutConditionsDecision,
  approvedWithConditionsDeclinedDecision,
  approvedWithoutConditionsDeclinedDecision,
  declinedDecision,
  banksDecisionEmailVariables } = require('../emails/amendments/manual-amendment-decision-email-variables');

// checks if amendment exists and if eligble to send email
const amendmentEmailEligible = (amendment) => {
  if (amendment && (amendment?.automaticApprovalEmail || amendment?.ukefDecision?.managersDecisionEmail || amendment?.bankDecision?.banksDecisionEmail)) {
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
  const template = EMAIL_TEMPLATE_IDS.AUTOMATIC_AMENDMENT;

  const emailResponse = await sendTfmEmail(template, user.email, automaticAmendmentEmailVariables(amendmentVariables));
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
  const template = EMAIL_TEMPLATE_IDS.MANUAL_AMENDMENT_DECISION_APPROVED_W_CONDITIONS;

  const emailResponse = await sendTfmEmail(template, user.email, approvedWithConditionsDecision(amendmentVariables));
  // if successful, then updates flag to say email has been sent
  if (emailResponse) {
    await managersDecisionUpdateEmailConfirmation(facilityId, amendmentId);
  }
};

const emailApprovedWithoutConditions = async (amendmentVariables) => {
  const { user, facilityId, amendmentId } = amendmentVariables;
  const template = EMAIL_TEMPLATE_IDS.MANUAL_AMENDMENT_DECISION_APPROVED_WO_CONDITIONS;

  const emailResponse = await sendTfmEmail(template, user.email, approvedWithoutConditionsDecision(amendmentVariables));
  // if successful, then updates flag to say email has been sent
  if (emailResponse) {
    await managersDecisionUpdateEmailConfirmation(facilityId, amendmentId);
  }
};

const emailApprovedWithConditionsDeclined = async (amendmentVariables) => {
  const { user, facilityId, amendmentId } = amendmentVariables;
  const template = EMAIL_TEMPLATE_IDS.MANUAL_AMENDMENT_DECISION_APPROVED_W_CONDITIONS_DECLINED;

  const emailResponse = await sendTfmEmail(template, user.email, approvedWithConditionsDeclinedDecision(amendmentVariables));
  // if successful, then updates flag to say email has been sent
  if (emailResponse) {
    await managersDecisionUpdateEmailConfirmation(facilityId, amendmentId);
  }
};

const emailApprovedWithoutConditionsDeclined = async (amendmentVariables) => {
  const { user, facilityId, amendmentId } = amendmentVariables;
  const template = EMAIL_TEMPLATE_IDS.MANUAL_AMENDMENT_DECISION_APPROVED_WO_CONDITIONS_DECLINED;

  const emailResponse = await sendTfmEmail(template, user.email, approvedWithoutConditionsDeclinedDecision(amendmentVariables));
  // if successful, then updates flag to say email has been sent
  if (emailResponse) {
    await managersDecisionUpdateEmailConfirmation(facilityId, amendmentId);
  }
};

const emailDeclined = async (amendmentVariables) => {
  const { user, facilityId, amendmentId } = amendmentVariables;
  const template = EMAIL_TEMPLATE_IDS.MANUAL_AMENDMENT_DECISION_DECLINED;

  const emailResponse = await sendTfmEmail(template, user.email, declinedDecision(amendmentVariables));
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

    // if approved without condtions and declined only
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

const emailBankDecision = async (amendmentVariables, template) => {
  const { user, facilityId, amendmentId } = amendmentVariables;

  const emailResponse = await sendTfmEmail(template, user.email, banksDecisionEmailVariables(amendmentVariables));
  // if successful, then updates flag to say email has been sent
  if (emailResponse) {
    await banksDecisionUpdateEmailConfirmation(facilityId, amendmentId);
  }
};

const sendManualBankDecisionEmail = async (amendmentVariables) => {
  const { amendment } = amendmentVariables;
  const { bankDecision } = amendment;

  const proceed = AMENDMENT_BANK_DECISION.PROCEED;
  const withdraw = AMENDMENT_BANK_DECISION.WITHDRAW;

  try {
    if (bankDecision.decision === proceed) {
      await emailBankDecision(amendmentVariables, EMAIL_TEMPLATE_IDS.MANUAL_AMENDMENT_BANK_PROCEED);
    } else if (bankDecision.decision === withdraw) {
      await emailBankDecision(amendmentVariables, EMAIL_TEMPLATE_IDS.MANUAL_AMENDMENT_BANK_WITHDRAW);
    } else {
      console.error('Incorrect bankDecision passed for manual amendment email');
    }
  } catch (error) {
    console.error('Error sending manual amendment bank decision email', { error });
  }
};

module.exports = { amendmentEmailEligible,
  sendAutomaticAmendmentEmail,
  sendManualDecisionAmendmentEmail,
  sendManualBankDecisionEmail };
