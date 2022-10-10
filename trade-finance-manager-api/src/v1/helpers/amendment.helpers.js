const { format, fromUnixTime } = require('date-fns');
const api = require('../api');
const sendTfmEmail = require('../controllers/send-tfm-email');
const { UNDERWRITER_MANAGER_DECISIONS } = require('../../constants/amendments');
const {
  AMENDMENT_UW_DECISION,
  AMENDMENT_BANK_DECISION,
  AMENDMENT_STATUS,
} = require('../../constants/deals');
const { CURRENCY } = require('../../constants/currency.constant');
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
 * Initiate an internal UKEF team email, upon an amendment
 * submission (automatic) and approval (manual)
 * @param {String} ukefFacilityId UKEF Facility ID
 */
const internalAmendmentEmail = async (ukefFacilityId) => {
  try {
    const templateId = EMAIL_TEMPLATE_IDS.INTERNAL_AMENDMENT_NOTIFICATION;
    const sendToEmailAddress = process.env.UKEF_INTERNAL_NOTIFICATION;
    const emailVariables = {
      ukefFacilityId,
    };

    await sendTfmEmail(templateId, sendToEmailAddress, emailVariables);
  } catch (error) {
    console.error('Error sending internal amendment email', { error });
  }
};

const roundValue = (valueInGBP) => {
  const totalDecimals = decimalsCount(valueInGBP);

  // rounds to 2 decimal palces if decimals greater than 2
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
    console.error('TFM-API - calculateAmendmentExposure - Error in amendment helper ', { error });
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

    const validConditions = (facilitySnapshot?.ukefFacilityType || facilitySnapshot?.type)
      && (facilitySnapshot?.coverStartDate || facilitySnapshot?.requestedCoverStartDate) && coverEndDate;

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
  } catch (err) {
    console.error('TFM API - Amendment helpers - Error calculating new amendment tenor', { err });
    return null;
  }
};

// populates tfmObject with date values for mapping by graphql
const addLatestAmendmentDates = async (tfmObject, latestDate, facilityId) => {
  // if there is a latest coverEndDate
  if (latestDate?.coverEndDate) {
    const { coverEndDate } = latestDate;
    const existingFacility = await api.findOneFacility(facilityId);

    if (!existingFacility) {
      return tfmObject;
    }
    // populates with coverEndDate and exposurePeriod
    const newTfmObject = {
      ...tfmObject,
      coverEndDate: latestDate.coverEndDate,
      amendmentExposurePeriodInMonths: await calculateAmendmentDateTenor(coverEndDate, existingFacility),
    };

    return newTfmObject;
  }
  return tfmObject;
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
  sendFirstTaskEmail,
  internalAmendmentEmail,
  canSendToAcbs,
  calculateUkefExposure,
  formatCoverEndDate,
  addLatestAmendmentValue,
  addLatestAmendmentDates,
  calculateAmendmentDateTenor,
  calculateAmendmentExposure,
  calculateAcbsUkefExposure,
  calculateNewFacilityValue,
  roundValue,
};
