const api = require('../api');
const CONSTANTS = require('../../constants');
const { getFirstTask } = require('../helpers/tasks');
const { generateTaskEmailVariables } = require('../helpers/generate-task-email-variables');
const generateAinMinConfirmationEmailVars = require('../emails/AIN-MIN-confirmation/generate-email-variables');
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
  (firstTask.title === CONSTANTS.TASKS.AIN_AND_MIA.GROUP_1.MATCH_OR_CREATE_PARTIES
    || firstTask.title === CONSTANTS.TASKS.AIN_AND_MIA.GROUP_1.CREATE_OR_LINK_SALESFORCE)
  && !firstTask.emailSent;

const sendFirstTaskEmail = async (deal) => {
  try {
    const {
      _id: dealId, ukefDealId, exporter, tfm,
    } = deal;

    const { tasks } = tfm;

    if (tasks) {
      const firstTask = getFirstTask(tasks);

      if (shouldSendFirstTaskEmail(firstTask)) {
        const urlOrigin = process.env.TFM_URI;
        const templateId = CONSTANTS.EMAIL_TEMPLATE_IDS.TASK_READY_TO_START;

        const { team } = firstTask;
        const { email: sendToEmailAddress } = await api.findOneTeam(team.id);

        const emailVariables = generateTaskEmailVariables(urlOrigin, firstTask, dealId, exporter.companyName, ukefDealId);

        return sendTfmEmail(templateId, sendToEmailAddress, emailVariables, deal);
      }
    }
  } catch (err) {
    console.error('TFM-API error sending first task email', { err });
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

  let templateId;
  let emailVariables;
  let emailResponse;
  let bankResponse;
  let pimEmailResponse;

  if (dealType === CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS) {
    templateId = CONSTANTS.EMAIL_TEMPLATE_IDS.BSS_DEAL_MIA_RECEIVED;

    emailVariables = generateMiaConfirmationEmailVars(deal);

    // send an email to the maker
    emailResponse = await sendTfmEmail(templateId, sendToEmailAddress, emailVariables, deal);
    // send a copy of the email to the bank's general email address
    bankResponse = bankEmails.map((email) => sendTfmEmail(templateId, email, emailVariables, deal));
    // send a copy of the email to PIM
    pimEmailResponse = await sendTfmEmail(templateId, pimEmail, emailVariables, deal);

    return { emailResponse, bankResponse, pimEmailResponse };
  }

  if (dealType === CONSTANTS.DEALS.DEAL_TYPE.GEF) {
    templateId = CONSTANTS.EMAIL_TEMPLATE_IDS.GEF_DEAL_MIA_RECEIVED;

    emailVariables = generateMiaConfirmationEmailVars(deal);

    // send an email to the maker
    emailResponse = await sendTfmEmail(templateId, sendToEmailAddress, emailVariables, deal);
    // send a copy of the email to the bank's general email address
    bankResponse = bankEmails.map((email) => sendTfmEmail(templateId, email, emailVariables, deal));
    // send a copy of the email to PIM
    pimEmailResponse = await sendTfmEmail(templateId, pimEmail, emailVariables, deal);

    return { emailResponse, bankResponse, pimEmailResponse };
  }

  return null;
};

const generateBssDealAinMinConfirmationEmailVariables = (deal, facilityLists) => {
  const {
    ukefDealId, bankInternalRefName, submissionType, maker, exporter,
  } = deal;

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
    const {
      dealType, submissionType, maker, facilities,
    } = deal;

    if (submissionType !== CONSTANTS.DEALS.SUBMISSION_TYPE.MIN && submissionType !== CONSTANTS.DEALS.SUBMISSION_TYPE.AIN) {
      console.info('The current deal is not an AIN or MIN deal', deal?._id);
      return null;
    }

    let facilityLists;
    let templateId;
    let emailVariables;
    let makerEmailResponse;
    let pimEmailResponse;
    let bankResponse;
    const bankId = maker.bank.id;
    const { email: makerEmailAddress } = maker;
    const { emails: bankEmails } = await api.findBankById(bankId);
    // get the email address for PIM user
    const { email: pimEmail } = await api.findOneTeam(CONSTANTS.TEAMS.PIM.id);

    if (dealType === CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS) {
      facilityLists = generateFacilityLists(dealType, facilities);

      templateId = CONSTANTS.EMAIL_TEMPLATE_IDS.BSS_DEAL_SUBMIT_CONFIRMATION;

      emailVariables = generateBssDealAinMinConfirmationEmailVariables(deal, facilityLists);

      // send an email to the maker
      makerEmailResponse = await sendTfmEmail(templateId, makerEmailAddress, emailVariables, deal);
      // send a copy of the email to PIM
      pimEmailResponse = await sendTfmEmail(templateId, pimEmail, emailVariables, deal);
      // send a copy of the email to the bank's general email address
      bankResponse = bankEmails.map((email) => sendTfmEmail(templateId, email, emailVariables, deal));
      return { makerEmailResponse, pimEmailResponse, bankResponse };
    }

    if (dealType === CONSTANTS.DEALS.DEAL_TYPE.GEF) {
      facilityLists = gefFacilitiesList(facilities);

      templateId = CONSTANTS.EMAIL_TEMPLATE_IDS.GEF_DEAL_SUBMIT_CONFIRMATION;

      emailVariables = await generateAinMinConfirmationEmailVars(deal, facilityLists);

      makerEmailResponse = await sendTfmEmail(templateId, makerEmailAddress, emailVariables, deal);
      // send a copy of the email to PIM
      pimEmailResponse = await sendTfmEmail(templateId, pimEmail, emailVariables, deal);
      // send a copy of the email to the bank's general email address
      bankResponse = bankEmails.map((email) => sendTfmEmail(templateId, email, emailVariables, deal));

      return { makerEmailResponse, pimEmailResponse, bankResponse };
    }
  } catch (err) {
    console.error('TFM-API - Error sending AIN/MIN acknowledgement email', { err });
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
  } catch (err) {
    console.error('TFM-API - Error sending deal submit emails', { err });
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
