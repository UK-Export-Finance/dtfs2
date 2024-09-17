const api = require('../api');
const CONSTANTS = require('../../constants');
const { getFirstTask } = require('../helpers/tasks');
const { generateTaskEmailVariables } = require('../helpers/generate-task-email-variables');
const gefEmailVariables = require('../emails/AIN-MIN-confirmation/gef-email-variables');
const { gefFacilitiesList } = require('../emails/AIN-MIN-confirmation/gef-facilities-list');
const { generateFacilityLists } = require('../helpers/notify-template-formatters');
const { generateMiaConfirmationEmailVars } = require('../emails/MIA-confirmation/generate-email-variables');
const sendTfmEmail = require('./send-tfm-email');

/**
 * Make sure the first task is either:
 * - `Match or Create Parties`
 * - 'Create or link this opportunity in Salesforce'
 * Note: the Parties task is not created if a deal has exporter.partyUrn.
 * If the first task changes in the future, and is not one of these,
 * we might not want to send an email.
 * */
const shouldSendFirstTaskEmail = (firstTask) =>
  (firstTask.title === CONSTANTS.TASKS.AIN_AND_MIA.GROUP_1.MATCH_OR_CREATE_PARTIES ||
    firstTask.title === CONSTANTS.TASKS.AIN_AND_MIA.GROUP_1.CREATE_OR_LINK_SALESFORCE) &&
  !firstTask.emailSent;

const sendFirstTaskEmail = async (deal) => {
  try {
    const { _id: dealId, ukefDealId, exporter, tfm } = deal;

    const { tasks } = tfm;

    if (tasks) {
      const firstTask = getFirstTask(tasks);

      if (shouldSendFirstTaskEmail(firstTask)) {
        const urlOrigin = process.env.TFM_UI_URL;
        const templateId = CONSTANTS.EMAIL_TEMPLATE_IDS.TASK_READY_TO_START;

        const { team } = firstTask;
        const { email: sendToEmailAddress } = await api.findOneTeam(team.id);

        const emailVariables = generateTaskEmailVariables(urlOrigin, firstTask, dealId, exporter.companyName, ukefDealId);

        return sendTfmEmail(templateId, sendToEmailAddress, emailVariables, deal);
      }
    }
  } catch (error) {
    console.error('TFM-API error sending first task email %o', error);
  }

  return null;
};

const sendMiaAcknowledgement = async (deal) => {
  const { dealType, submissionType, maker } = deal;

  if (submissionType !== CONSTANTS.DEALS.SUBMISSION_TYPE.MIA) {
    return null;
  }

  const { email: sendToEmailAddress } = maker;
  const bankId = maker.bank.id;
  const { emails: bankEmails } = await api.findBankById(bankId);
  // get the email address for PIM user
  const { email: pimEmail } = await api.findOneTeam(CONSTANTS.TEAMS.PIM.id);

  if (dealType === CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS) {
    const templateId = CONSTANTS.EMAIL_TEMPLATE_IDS.BSS_DEAL_MIA_RECEIVED;

    const emailVariables = generateMiaConfirmationEmailVars(deal);

    // send an email to the maker
    const emailResponse = await sendTfmEmail(templateId, sendToEmailAddress, emailVariables, deal);
    // send a copy of the email to the bank's general email address
    const bankResponses = await Promise.all(bankEmails.map((email) => sendTfmEmail(templateId, email, emailVariables, deal)));
    // send a copy of the email to PIM
    const pimEmailResponse = await sendTfmEmail(templateId, pimEmail, emailVariables, deal);

    return { emailResponse, bankResponse: bankResponses, pimEmailResponse };
  }

  if (dealType === CONSTANTS.DEALS.DEAL_TYPE.GEF) {
    const templateId = CONSTANTS.EMAIL_TEMPLATE_IDS.GEF_DEAL_MIA_RECEIVED;

    const emailVariables = generateMiaConfirmationEmailVars(deal);

    // send an email to the maker
    const emailResponse = await sendTfmEmail(templateId, sendToEmailAddress, emailVariables, deal);
    // send a copy of the email to the bank's general email address
    const bankResponses = await Promise.all(bankEmails.map((email) => sendTfmEmail(templateId, email, emailVariables, deal)));
    // send a copy of the email to PIM
    const pimEmailResponse = await sendTfmEmail(templateId, pimEmail, emailVariables, deal);

    return { emailResponse, bankResponses, pimEmailResponse };
  }

  return null;
};

const generateBssDealAinMinConfirmationEmailVariables = (deal, facilityLists) => {
  const { ukefDealId, bankInternalRefName, submissionType, maker, exporter } = deal;

  const { firstname, surname } = maker;

  return {
    firstname,
    surname,
    exporterName: exporter.companyName,
    bankReferenceNumber: bankInternalRefName,
    ukefDealId,
    isAin: submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.AIN ? 'yes' : 'no',
    isMin: submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.MIN ? 'yes' : 'no',
    issuedFacilitiesList: facilityLists.issued,
    showIssuedHeader: facilityLists.issued ? 'yes' : 'no',
    unissuedFacilitiesList: facilityLists.unissued,
    showUnissuedHeader: facilityLists.unissued ? 'yes' : 'no',
  };
};

const sendAinMinAcknowledgement = async (deal) => {
  try {
    const { dealType, submissionType, maker, facilities } = deal;

    if (submissionType !== CONSTANTS.DEALS.SUBMISSION_TYPE.MIN && submissionType !== CONSTANTS.DEALS.SUBMISSION_TYPE.AIN) {
      console.info('The current deal is not an AIN or MIN deal %s', deal?._id);
      return null;
    }

    const bankId = maker.bank.id;
    const { email: makerEmailAddress } = maker;
    const { emails: bankEmails } = await api.findBankById(bankId);
    // get the email address for PIM user
    const { email: pimEmail } = await api.findOneTeam(CONSTANTS.TEAMS.PIM.id);

    if (dealType === CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS) {
      const facilityLists = generateFacilityLists(dealType, facilities);

      const templateId = CONSTANTS.EMAIL_TEMPLATE_IDS.BSS_DEAL_SUBMIT_CONFIRMATION;

      const emailVariables = generateBssDealAinMinConfirmationEmailVariables(deal, facilityLists);

      // send an email to the maker
      const makerEmailResponse = await sendTfmEmail(templateId, makerEmailAddress, emailVariables, deal);
      // send a copy of the email to PIM
      const pimEmailResponse = await sendTfmEmail(templateId, pimEmail, emailVariables, deal);
      // send a copy of the email to the bank's general email address
      const bankResponse = await Promise.all(bankEmails.map((email) => sendTfmEmail(templateId, email, emailVariables, deal)));
      return { makerEmailResponse, pimEmailResponse, bankResponse };
    }

    if (dealType === CONSTANTS.DEALS.DEAL_TYPE.GEF) {
      const facilityLists = gefFacilitiesList(facilities);

      const templateId = CONSTANTS.EMAIL_TEMPLATE_IDS.GEF_DEAL_SUBMIT_CONFIRMATION;

      const emailVariables = await gefEmailVariables(deal, facilityLists);

      const makerEmailResponse = await sendTfmEmail(templateId, makerEmailAddress, emailVariables, deal);
      // send a copy of the email to PIM
      const pimEmailResponse = await sendTfmEmail(templateId, pimEmail, emailVariables, deal);
      // send a copy of the email to the bank's general email address
      const bankResponses = await Promise.all(bankEmails.map((email) => sendTfmEmail(templateId, email, emailVariables, deal)));

      return { makerEmailResponse, pimEmailResponse, bankResponses };
    }
  } catch (error) {
    console.error('TFM-API - Error sending AIN/MIN acknowledgement email %o', error);
  }

  return null;
};

const sendDealSubmitEmails = async (deal) => {
  try {
    if (!deal) {
      return false;
    }

    const firstTaskEmail = await sendFirstTaskEmail(deal);
    const emailAcknowledgementMIA = await sendMiaAcknowledgement(deal);
    const emailAcknowledgementAinMin = await sendAinMinAcknowledgement(deal);

    return {
      firstTaskEmail,
      emailAcknowledgementMIA,
      emailAcknowledgementAinMin,
    };
  } catch (error) {
    console.error('TFM-API - Error sending deal submit emails %o', error);
    return {};
  }
};

module.exports = {
  shouldSendFirstTaskEmail,
  sendFirstTaskEmail,
  sendDealSubmitEmails,
  sendMiaAcknowledgement,
  generateBssDealAinMinConfirmationEmailVariables,
  sendAinMinAcknowledgement,
};
