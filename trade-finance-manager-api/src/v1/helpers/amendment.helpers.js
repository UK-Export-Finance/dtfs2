const { format, fromUnixTime } = require('date-fns');
const { CURRENCY, AMENDMENT_STATUS } = require('@ukef/dtfs2-common');
const api = require('../api');
const sendTfmEmail = require('../controllers/send-tfm-email');
const { UNDERWRITER_MANAGER_DECISIONS } = require('../../constants/amendments');
const { TEAMS } = require('../../constants');
const { AMENDMENT_UW_DECISION, AMENDMENT_BANK_DECISION } = require('../../constants/deals');
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
const dealTypeCoverStartDate = require('./dealTypeCoverStartDate.helper');
const { formattedNumber } = require('../../utils/number');
const { decimalsCount, roundNumber } = require('./number');

const { TFM_UI_URL } = process.env;

// checks if amendment exists and if eligible to send email
const amendmentEmailEligible = (amendment) =>
  amendment &&
  (amendment?.automaticApprovalEmail ||
    amendment?.ukefDecision?.managersDecisionEmail ||
    amendment?.bankDecision?.banksDecisionEmail ||
    amendment?.sendFirstTaskEmail);

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
 * @returns {boolean} Whether both the amendments decision has been declined by the underwriter.
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

const sendAutomaticAmendmentEmail = async (amendmentVariables, auditDetails) => {
  const { email: pimEmail } = await api.findOneTeam(TEAMS.PIM.id);
  const { user, facilityId, amendmentId } = amendmentVariables;
  const templateId = EMAIL_TEMPLATE_IDS.AUTOMATIC_AMENDMENT;
  const emailVariables = automaticAmendmentEmailVariables(amendmentVariables);

  try {
    const emailResponse = await sendTfmEmail(templateId, user.email, emailVariables);
    // Send a copy to `PIM`
    const pimEmailResponse = await sendTfmEmail(templateId, pimEmail, emailVariables);

    // if successful, then updates flag to say email has been sent
    if (emailResponse && pimEmailResponse) {
      await api.updateFacilityAmendment(facilityId, amendmentId, { automaticApprovalEmailSent: true }, auditDetails);
    }
  } catch (error) {
    console.error('TFM-API error sending email - sendAutomaticAmendmentEmail %o', error);
  }
};

// updates flag if managers decision email sent so not sent again
const managersDecisionUpdateEmailConfirmation = async (facilityId, amendmentId, auditDetails) => {
  const payload = {
    ukefDecision: {
      managersDecisionEmailSent: true,
    },
  };
  await api.updateFacilityAmendment(facilityId, amendmentId, payload, auditDetails);
};

const emailApprovedWithWithoutConditions = async (amendmentVariables, auditDetails) => {
  const { email: pimEmail } = await api.findOneTeam(TEAMS.PIM.id);
  const { user, facilityId, amendmentId } = amendmentVariables;
  const templateId = EMAIL_TEMPLATE_IDS.MANUAL_AMENDMENT_DECISION_APPROVED_W_CONDITIONS;
  const emailVariables = approvedWithWithoutConditionsDecision(amendmentVariables);

  try {
    const emailResponse = await sendTfmEmail(templateId, user.email, emailVariables);
    // Send a copy to `PIM`
    const pimEmailResponse = await sendTfmEmail(templateId, pimEmail, emailVariables);

    // if successful, then updates flag to say email has been sent
    if (pimEmailResponse && emailResponse) {
      await managersDecisionUpdateEmailConfirmation(facilityId, amendmentId, auditDetails);
    }
  } catch (error) {
    console.error('TFM-API error sending email - emailApprovedWithWithoutConditions %o', error);
  }
};

const emailApprovedWithoutConditions = async (amendmentVariables, auditDetails) => {
  const { email: pimEmail } = await api.findOneTeam(TEAMS.PIM.id);
  const { user, facilityId, amendmentId } = amendmentVariables;
  const templateId = EMAIL_TEMPLATE_IDS.MANUAL_AMENDMENT_DECISION_APPROVED_WO_CONDITIONS;
  const emailVariables = approvedWithWithoutConditionsDecision(amendmentVariables);

  try {
    const emailResponse = await sendTfmEmail(templateId, user.email, emailVariables);
    // Send a copy to `PIM`
    const pimEmailResponse = await sendTfmEmail(templateId, pimEmail, emailVariables);

    // if successful, then updates flag to say email has been sent
    if (pimEmailResponse && emailResponse) {
      await managersDecisionUpdateEmailConfirmation(facilityId, amendmentId, auditDetails);
    }
  } catch (error) {
    console.error('TFM-API error sending email - emailApprovedWithoutConditions %o', error);
  }
};

const emailApprovedWithConditionsDeclined = async (amendmentVariables, auditDetails) => {
  const { email: pimEmail } = await api.findOneTeam(TEAMS.PIM.id);
  const { user, facilityId, amendmentId } = amendmentVariables;
  const templateId = EMAIL_TEMPLATE_IDS.MANUAL_AMENDMENT_DECISION_APPROVED_W_CONDITIONS_DECLINED;
  const emailVariables = approvedWithConditionsDeclinedDecision(amendmentVariables);

  try {
    const emailResponse = await sendTfmEmail(templateId, user.email, emailVariables);
    // Send a copy to `PIM`
    const pimEmailResponse = await sendTfmEmail(templateId, pimEmail, emailVariables);

    // if successful, then updates flag to say email has been sent
    if (pimEmailResponse && emailResponse) {
      await managersDecisionUpdateEmailConfirmation(facilityId, amendmentId, auditDetails);
    }
  } catch (error) {
    console.error('TFM-API error sending email - emailApprovedWithConditionsDeclined %o', error);
  }
};

const emailApprovedWithoutConditionsDeclined = async (amendmentVariables, auditDetails) => {
  const { email: pimEmail } = await api.findOneTeam(TEAMS.PIM.id);
  const { user, facilityId, amendmentId } = amendmentVariables;
  const templateId = EMAIL_TEMPLATE_IDS.MANUAL_AMENDMENT_DECISION_APPROVED_WO_CONDITIONS_DECLINED;
  const emailVariables = approvedWithoutConditionsDeclinedDecision(amendmentVariables);

  try {
    const emailResponse = await sendTfmEmail(templateId, user.email, emailVariables);
    // Send a copy to `PIM`
    const pimEmailResponse = await sendTfmEmail(templateId, pimEmail, emailVariables);

    // if successful, then updates flag to say email has been sent
    if (pimEmailResponse && emailResponse) {
      await managersDecisionUpdateEmailConfirmation(facilityId, amendmentId, auditDetails);
    }
  } catch (error) {
    console.error('TFM-API error sending email - emailApprovedWithoutConditionsDeclined %o', error);
  }
};

const emailDeclined = async (amendmentVariables, auditDetails) => {
  const { email: pimEmail } = await api.findOneTeam(TEAMS.PIM.id);
  const { user, facilityId, amendmentId } = amendmentVariables;
  const templateId = EMAIL_TEMPLATE_IDS.MANUAL_AMENDMENT_DECISION_DECLINED;
  const emailVariables = declinedDecision(amendmentVariables);

  try {
    const emailResponse = await sendTfmEmail(templateId, user.email, emailVariables);
    // Send a copy to `PIM`
    const pimEmailResponse = await sendTfmEmail(templateId, pimEmail, emailVariables);

    // if successful, then updates flag to say email has been sent
    if (pimEmailResponse && emailResponse) {
      await managersDecisionUpdateEmailConfirmation(facilityId, amendmentId, auditDetails);
    }
  } catch (error) {
    console.error('TFM-API error sending email - emailDeclined %o', error);
  }
};

const sendManualDecisionAmendmentEmail = async (amendmentVariables, auditDetails) => {
  const { amendment } = amendmentVariables;
  const { ukefDecision } = amendment;

  try {
    // if one is approved with conditions and not declined
    if (isApprovedWithConditions(ukefDecision) && !amendmentDeclined(amendment)) {
      await emailApprovedWithWithoutConditions(amendmentVariables, auditDetails);

      // if only approved without conditions (and not declined or with conditions)
    } else if (isApprovedWithoutConditions(ukefDecision) && !amendmentDeclined(amendment) && !isApprovedWithConditions(ukefDecision)) {
      await emailApprovedWithoutConditions(amendmentVariables, auditDetails);

      // if approved with conditions and declined only
    } else if (isApprovedWithConditions(ukefDecision) && amendmentDeclined(amendment) && !isApprovedWithoutConditions(ukefDecision)) {
      await emailApprovedWithConditionsDeclined(amendmentVariables, auditDetails);

      // if approved without conditions and declined only
    } else if (isApprovedWithoutConditions(ukefDecision) && amendmentDeclined(amendment) && !isApprovedWithConditions(ukefDecision)) {
      await emailApprovedWithoutConditionsDeclined(amendmentVariables, auditDetails);

      // if declined only
    } else if (amendmentDeclined(amendment) && !isApprovedWithConditions(ukefDecision) && !isApprovedWithoutConditions(ukefDecision)) {
      await emailDeclined(amendmentVariables, auditDetails);
    } else {
      console.error('Incorrect ukefDecision passed for manual amendment email');
    }
  } catch (error) {
    console.error('Error sending manual amendment underwriter decision email %o', error);
  }
};

// updates flag if managers decision email sent so not sent again
const banksDecisionUpdateEmailConfirmation = async (facilityId, amendmentId, auditDetails) => {
  const payload = {
    bankDecision: {
      banksDecisionEmailSent: true,
    },
  };
  await api.updateFacilityAmendment(facilityId, amendmentId, payload, auditDetails);
};

const emailBankDecision = async (amendmentVariables, templateId, auditDetails) => {
  const { email: pimEmail } = await api.findOneTeam(TEAMS.PIM.id);
  const { user, facilityId, amendmentId } = amendmentVariables;
  const emailVariables = banksDecisionEmailVariables(amendmentVariables);

  try {
    const emailResponse = await sendTfmEmail(templateId, user.email, emailVariables);
    // Send a copy to `PIM`
    const pimEmailResponse = await sendTfmEmail(templateId, pimEmail, emailVariables);

    // if successful, then updates flag to say email has been sent
    if (pimEmailResponse && emailResponse) {
      await banksDecisionUpdateEmailConfirmation(facilityId, amendmentId, auditDetails);
    }
  } catch (error) {
    console.error('TFM-API error sending email - emailBankDecision %o', error);
  }
};

const sendManualBankDecisionEmail = async (amendmentVariables, auditDetails) => {
  const { amendment } = amendmentVariables;
  const { bankDecision } = amendment;

  const { PROCEED, WITHDRAW } = AMENDMENT_BANK_DECISION;

  try {
    if (bankDecision.decision === PROCEED) {
      await emailBankDecision(amendmentVariables, EMAIL_TEMPLATE_IDS.MANUAL_AMENDMENT_BANK_PROCEED, auditDetails);
    } else if (bankDecision.decision === WITHDRAW) {
      await emailBankDecision(amendmentVariables, EMAIL_TEMPLATE_IDS.MANUAL_AMENDMENT_BANK_WITHDRAW, auditDetails);
    } else {
      console.error('Incorrect bankDecision passed for manual amendment email');
    }
  } catch (error) {
    console.error('Error sending manual amendment bank decision email %o', error);
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
const firstTaskEmailConfirmation = async (facilityId, amendmentId, auditDetails) => {
  const payload = {
    firstTaskEmailSent: true,
  };
  await api.updateFacilityAmendment(facilityId, amendmentId, payload, auditDetails);
};

/**
 * Sends an email notification for the first task of an amendment.
 *
 * This function performs the following operations:
 * 1. Extracts necessary details from the deal and amendment.
 * 2. Retrieves the first task from the amendment tasks.
 * 3. Constructs the email variables and sends the email using the TFM email service.
 * 4. Updates the flag to indicate that the email has been sent if the email is successfully sent.
 *
 * @param {Object} deal - The deal object containing deal and amendment details.
 * @param {Object} deal.amendment - The amendment details.
 * @param {Object} deal.dealSnapshot - The snapshot of the deal details.
 * @param {string} deal.facilityId - The ID of the facility.
 * @param {string} deal.amendmentId - The ID of the amendment.
 * @param {Object} deal.dealSnapshot.exporter - The exporter details.
 * @param {string} deal.dealSnapshot.exporter.companyName - The name of the exporter company.
 * @param {string} [deal.dealSnapshot.ukefDealId] - The UKEF deal ID for GEF deals.
 * @param {Object} [deal.dealSnapshot.details] - The details object for BSS deals.
 * @param {string} [deal.dealSnapshot.details.ukefDealId] - The UKEF deal ID for BSS deals.
 * @param {Object} auditDetails - The audit details for logging purposes.
 * @returns {Promise<void>} - A promise that resolves when the email has been sent and the flag has been updated.
 */
const sendFirstTaskEmail = async (deal, auditDetails) => {
  try {
    const { amendment, dealSnapshot, facilityId, amendmentId } = deal;
    const { tasks } = amendment;
    const { _id: dealId } = deal;
    const { exporter } = dealSnapshot;
    const { companyName } = exporter;

    // dealId in snapshot for gef and details for bss
    const ukefDealId = dealSnapshot.ukefDealId || dealSnapshot?.details?.ukefDealId;
    const firstTask = getFirstTask(tasks);
    const templateId = EMAIL_TEMPLATE_IDS.TASK_READY_TO_START;

    if (!dealId || !ukefDealId || !firstTask || !companyName) {
      throw new Error(`Invalid imperative arguments provided for ${dealId}`);
    }

    const { team } = firstTask;
    const { email: sendToEmailAddress } = await api.findOneTeam(team.id);

    const emailVariables = generateTaskEmailVariables(TFM_UI_URL, firstTask, dealId, companyName, ukefDealId);

    const emailResponse = await sendTfmEmail(templateId, sendToEmailAddress, emailVariables);

    // if successful, then updates flag to say email has been sent
    if (emailResponse) {
      await firstTaskEmailConfirmation(facilityId, amendmentId, auditDetails);
    }
  } catch (error) {
    console.error('Error sending first amendment task email %o', error);
  }
};

/**
 * Initiate an internal UKEF team email, upon an amendment
 * submission (automatic) and approval (manual)
 * @param {string} ukefFacilityId UKEF Facility ID
 */
const internalAmendmentEmail = (ukefFacilityId) => {
  try {
    const templateId = EMAIL_TEMPLATE_IDS.INTERNAL_AMENDMENT_NOTIFICATION;
    const sendToEmailAddress = process.env.UKEF_INTERNAL_NOTIFICATION;
    const emailVariables = {
      ukefFacilityId,
    };

    if (!ukefFacilityId) {
      return false;
    }

    return sendTfmEmail(templateId, sendToEmailAddress, emailVariables);
  } catch (error) {
    console.error('Error sending internal amendment email %o', error);
    return false;
  }
};

const roundValue = (valueInGBP) => {
  const totalDecimals = decimalsCount(valueInGBP);

  // rounds to 2 decimal palaces if decimals greater than 2
  const newValue = totalDecimals > 2 ? roundNumber(valueInGBP, 2) : valueInGBP;

  return newValue;
};

// calculates new facility value in GBP
const calculateNewFacilityValue = (exchangeRate, amendment) => {
  const { currency, value: amendmentValue } = amendment;
  let newValue;

  if (currency && amendmentValue) {
    // if already in GBP, just take the value
    if (currency === CURRENCY.GBP) {
      newValue = amendmentValue;
    } else {
      // if no exchange rate return null
      if (!exchangeRate) {
        return null;
      }
      const valueInGBP = amendmentValue * exchangeRate;
      newValue = roundValue(valueInGBP);
    }

    return newValue;
  }

  return null;
};

// calculates new ukef exposure from amendment value
const calculateUkefExposure = (facilityValueInGBP, coverPercentage) => {
  if (facilityValueInGBP && coverPercentage) {
    // parse float as can have 2 decimal places in facility value
    const calculation = parseFloat(facilityValueInGBP, 10) * (coverPercentage / 100);
    const totalDecimals = decimalsCount(calculation);

    const ukefExposure = totalDecimals > 2 ? roundNumber(calculation, 2) : calculation;

    return ukefExposure;
  }

  return null;
};

const calculateAmendmentExposure = async (amendmentId, facilityId, latestValue) => {
  try {
    // requires certain parameters from fullAmendment and facility
    const fullAmendment = await api.getAmendmentById(facilityId, amendmentId);
    const existingFacility = await api.findOneFacility(facilityId);

    const { facilitySnapshot, tfm } = existingFacility;
    const { coverPercentage, coveredPercentage } = facilitySnapshot;
    const { requireUkefApproval, effectiveDate, bankDecision } = fullAmendment;

    // value of ukefExposureCalculationTime from automatic amendment submission time or manual amendment bankDecision submission time
    const ukefExposureTimestamp = requireUkefApproval ? bankDecision.effectiveDate : effectiveDate;

    // BSS is coveredPercentage while GEF is coverPercentage
    const coverPercentageValue = coverPercentage || coveredPercentage;

    const valueInGBP = calculateNewFacilityValue(tfm?.exchangeRate, latestValue);
    const ukefExposureValue = calculateUkefExposure(valueInGBP, coverPercentageValue);

    // sets new exposure value based on amendment value
    const formattedUkefExposure = formattedNumber(ukefExposureValue);
    // converts from seconds unix timestamp to one with milliseconds
    const ukefExposureCalculationTimestampValue = new Date(ukefExposureTimestamp * 1000).valueOf();

    return {
      exposure: formattedUkefExposure,
      timestamp: ukefExposureCalculationTimestampValue,
      ukefExposureValue,
    };
  } catch (error) {
    console.error('TFM-API - calculateAmendmentExposure - Error in amendment helper %o', error);
    return null;
  }
};

// populates amendment value, currency and exposure into tfmObject
const addLatestAmendmentValue = async (tfmObject, latestValue, facilityId) => {
  if (latestValue?.value) {
    const { value, currency, amendmentId } = latestValue;

    const newTfmObject = {
      ...tfmObject,
      value: {
        value,
        currency,
      },
      exposure: await calculateAmendmentExposure(amendmentId, facilityId, latestValue),
    };
    return newTfmObject;
  }
  return tfmObject;
};

// calculates the amendment exposure period from external API call and returns the number of months
const calculateAmendmentDateTenor = async (coverEndDate, existingFacility) => {
  try {
    const { facilitySnapshot } = existingFacility;

    const validConditions =
      (facilitySnapshot?.ukefFacilityType || facilitySnapshot?.type) &&
      (facilitySnapshot?.coverStartDate || facilitySnapshot?.requestedCoverStartDate) &&
      coverEndDate;

    if (validConditions) {
      const { ukefFacilityType, type } = facilitySnapshot;
      const facilityType = ukefFacilityType || type;

      const coverStartDate = dealTypeCoverStartDate(facilitySnapshot);
      // formatting for external api call
      const coverStartDateFormatted = format(new Date(coverStartDate), 'yyyy-MM-dd');
      const coverEndDateFormatted = format(fromUnixTime(coverEndDate), 'yyyy-MM-dd');

      const updatedTenor = await api.getFacilityExposurePeriod(coverStartDateFormatted, coverEndDateFormatted, facilityType);
      // returns exposure period in months to add to tfmObject
      if (updatedTenor?.exposurePeriodInMonths) {
        return updatedTenor.exposurePeriodInMonths;
      }
    }

    return null;
  } catch (error) {
    console.error('TFM API - Amendment helpers - Error calculating new amendment tenor %o', error);
    return null;
  }
};

/**
 * Populates the tfmObject with cover end date values
 * @param {import('@ukef/dtfs2-common').FacilityAmendmentTfmObject} tfmObject
 * @param {{ coverEndDate?: number } | undefined} latestCoverEndDateResponse
 * @param {string} facilityId
 * @returns {Promise<import('@ukef/dtfs2-common').FacilityAmendmentTfmObject>}
 */
const addLatestAmendmentCoverEndDate = async (tfmObject, latestCoverEndDateResponse, facilityId) => {
  const existingFacility = await api.findOneFacility(facilityId);

  if (!existingFacility) {
    return tfmObject;
  }

  const coverEndDate = latestCoverEndDateResponse?.coverEndDate;
  const amendmentExposurePeriodInMonths = coverEndDate ? await calculateAmendmentDateTenor(coverEndDate, existingFacility) : undefined;

  return {
    ...tfmObject,
    coverEndDate,
    amendmentExposurePeriodInMonths,
  };
};

/**
 * Populates the tfmObject with facility end date values
 * @param {import('@ukef/dtfs2-common').FacilityAmendmentTfmObject} tfmObject
 * @param {{facilityEndDate?: string, bankReviewDate?: string, isUsingFacilityEndDate?: boolean }} latestFacilityEndDateDataResponse
 * @returns {Promise<import('@ukef/dtfs2-common').FacilityAmendmentTfmObject>}
 */
const addLatestAmendmentFacilityEndDate = async (tfmObject, latestFacilityEndDateDataResponse) => {
  if (!latestFacilityEndDateDataResponse) {
    return tfmObject;
  }

  const { isUsingFacilityEndDate, facilityEndDate, bankReviewDate } = latestFacilityEndDateDataResponse;
  return {
    ...tfmObject,
    isUsingFacilityEndDate,
    facilityEndDate: isUsingFacilityEndDate ? facilityEndDate : undefined,
    bankReviewDate: isUsingFacilityEndDate === false ? bankReviewDate : undefined,
  };
};

/**
 * Calculates UKEF Exposure for the defined facility
 * based on updated facility amount and original cover percentage.
 * @param {Object} payload Amendment payload
 * @returns {Object} Computed payload with `ukefExposure` property calculated.
 */
const calculateAcbsUkefExposure = (payload) => {
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
    // TODO: DTFS2-7047 convert EPOCH to millisecond compatible epoch.
    const epoch = payload.coverEndDate.toString().length > 10 ? payload.coverEndDate : payload.coverEndDate * 1000;

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
  sendFirstTaskEmail,
  internalAmendmentEmail,
  canSendToAcbs,
  calculateUkefExposure,
  formatCoverEndDate,
  addLatestAmendmentValue,
  addLatestAmendmentCoverEndDate,
  addLatestAmendmentFacilityEndDate,
  calculateAmendmentDateTenor,
  calculateAmendmentExposure,
  calculateAcbsUkefExposure,
  calculateNewFacilityValue,
  roundValue,
};
