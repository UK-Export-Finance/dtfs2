const api = require('../api');
const CONSTANTS = require('../../constants');
const { getFirstTask } = require('../helpers/tasks');
const { issuedFacilities } = require('../helpers/issued-facilities');
const {
  generateFacilitiesListString,
  generateBSSListString,
  generateEWCSListString,
} = require('../helpers/notify-template-formatters');
const { generateTaskEmailVariables } = require('../helpers/generate-task-email-variables');
const sendTfmEmail = require('./send-tfm-email');

// make sure the first task is `Match or Create Parties`
// if the first task changes in the future, we might not want to send an email.
const shouldSendFirstTaskEmail = (firstTask) =>
  (firstTask.title === CONSTANTS.TASKS.AIN_AND_MIA.GROUP_1.MATCH_OR_CREATE_PARTIES);

const sendFirstTaskEmail = async (deal, urlOrigin) => {
  const { tfm, dealSnapshot } = deal;
  const { tasks } = tfm;

  const firstTask = getFirstTask(tasks);

  if (shouldSendFirstTaskEmail(firstTask)) {
    const templateId = CONSTANTS.EMAIL_TEMPLATE_IDS.TASK_READY_TO_START;

    const {
      _id: dealId,
      submissionDetails,
      details,
    } = dealSnapshot;

    const { 'supplier-name': exporterName } = submissionDetails;
    const { ukefDealId } = details;

    const { team } = firstTask;
    const { email: sendToEmailAddress } = await api.findOneTeam(team.id);

    const emailVariables = generateTaskEmailVariables(
      urlOrigin,
      firstTask,
      dealId,
      exporterName,
      ukefDealId,
    );

    const emailResponse = await sendTfmEmail(
      templateId,
      sendToEmailAddress,
      emailVariables,
      deal,
    );
    return emailResponse;
  }

  return null;
};

const sendMiaAcknowledgement = async (deal) => {
  const { dealSnapshot } = deal;

  const {
    bankSupplyContractID: bankReferenceNumber,
    ukefDealId,
    maker,
    submissionType,
  } = dealSnapshot.details;

  if (submissionType !== CONSTANTS.DEALS.SUBMISSION_TYPE.MIA) {
    return null;
  }

  const {
    'supplier-name': exporterName,
  } = dealSnapshot.submissionDetails;

  const {
    firstname: recipientName,
    email: sendToEmailAddress,
  } = maker;

  const templateId = CONSTANTS.EMAIL_TEMPLATE_IDS.DEAL_MIA_RECEIVED;

  const bssList = generateFacilitiesListString(dealSnapshot.bondTransactions.items);
  const ewcsList = generateFacilitiesListString(dealSnapshot.loanTransactions.items);

  const emailVariables = {
    recipientName,
    exporterName,
    bankReferenceNumber,
    ukefDealId,
    bssList,
    showBssHeader: bssList ? 'yes' : 'no',
    ewcsList,
    showEwcsHeader: ewcsList ? 'yes' : 'no',
  };

  const emailResponse = await sendTfmEmail(
    templateId,
    sendToEmailAddress,
    emailVariables,
    deal,
  );
  return emailResponse;
};

const sendAinMinIssuedFacilitiesAcknowledgement = async (deal) => {
  const { dealSnapshot } = deal;

  const {
    bankSupplyContractID: bankReferenceNumber,
    ukefDealId,
    maker,
    submissionType,
  } = dealSnapshot.details;

  if (submissionType !== CONSTANTS.DEALS.SUBMISSION_TYPE.MIN
    && submissionType !== CONSTANTS.DEALS.SUBMISSION_TYPE.AIN) {
    return null;
  }
  const {
    issuedBonds, unissuedBonds, issuedLoans, unissuedLoans,
  } = issuedFacilities(deal.dealSnapshot);

  const issuedBondsList = generateBSSListString(issuedBonds);
  const issuedLoansList = generateEWCSListString(issuedLoans);

  const unissuedBondsList = generateBSSListString(unissuedBonds);
  const unissuedLoansList = generateEWCSListString(unissuedLoans);

  const {
    'supplier-name': exporterName,
  } = dealSnapshot.submissionDetails;

  const {
    firstname,
    surname,
    email: sendToEmailAddress,
  } = maker;

  const templateId = CONSTANTS.EMAIL_TEMPLATE_IDS.DEAL_SUBMIT_MIN_AIN_FACILITIES_ISSUED;

  const issuedFacilitiesList = issuedBondsList + issuedLoansList;
  const unissuedFacilitiesList = unissuedBondsList + unissuedLoansList;

  const emailVariables = {
    firstname,
    surname,
    exporterName,
    bankReferenceNumber,
    ukefDealId,
    isAin: submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.AIN ? 'yes' : 'no',
    isMin: submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.MIN ? 'yes' : 'no',
    issuedFacilitiesList,
    showIssuedHeader: issuedFacilitiesList ? 'yes' : 'no',
    unissuedFacilitiesList,
    showUnissuedHeader: unissuedFacilitiesList ? 'yes' : 'no',
  };

  const emailResponse = await sendTfmEmail(
    templateId,
    sendToEmailAddress,
    emailVariables,
    deal,
  );
  return emailResponse;
};

const sendAinMinIssuedFacilitiesAcknowledgementByDealId = async (dealId) => {
  const deal = await api.findOneDeal(dealId);
  return sendAinMinIssuedFacilitiesAcknowledgement(deal);
};

const sendDealSubmitEmails = async (deal, urlOrigin) => {
  if (!deal) {
    return false;
  }

  // send email for the first task
  const firstTaskEmail = await sendFirstTaskEmail(deal, urlOrigin);

  const emailAcknowledgementMIA = await sendMiaAcknowledgement(deal);
  const emailAcknowledgementAinMinIssued = await sendAinMinIssuedFacilitiesAcknowledgement(deal);

  return {
    firstTaskEmail,
    emailAcknowledgementMIA,
    emailAcknowledgementAinMinIssued,
  };
};

module.exports = {
  shouldSendFirstTaskEmail,
  sendFirstTaskEmail,
  sendDealSubmitEmails,
  sendMiaAcknowledgement,
  generateFacilitiesListString,
  sendAinMinIssuedFacilitiesAcknowledgementByDealId,
};
