const moment = require('moment');
const api = require('../api');
const CONSTANTS = require('../../constants');
const formattedTimestamp = require('../formattedTimestamp');
const { getFirstTask } = require('../helpers/tasks');
const { capitalizeFirstLetter } = require('../../utils/string');
const sendTfmEmail = require('./send-tfm-email');

// make sure the first task is `Match or Create Parties`
// if the first task changes in the future, we might not want to send an email.
const shouldSendFirstTaskEmail = (firstTask) =>
  (firstTask.title === CONSTANTS.TASKS.AIN_AND_MIA.GROUP_1.MATCH_OR_CREATE_PARTIES);

const generateFacilitiesListString = (facilities) => facilities.reduce((acc, facility) => {
  const {
    facilityType, ukefFacilityID, bankReferenceNumber, uniqueIdentificationNumber,
  } = facility.facilitySnapshot;
  const fType = capitalizeFirstLetter(facilityType);
  const bankReference = uniqueIdentificationNumber || bankReferenceNumber;
  const bankRefString = bankReference
    ? `with your reference ${bankReference} `
    : '';

  return `${acc}- ${fType} facility ${bankRefString}has been given the UKEF reference: ${ukefFacilityID} \n`;
}, '');

const sendFirstTaskEmail = async (deal) => {
  const { tfm, dealSnapshot } = deal;
  const { tasks } = tfm;

  const firstTask = getFirstTask(tasks);

  const { team } = firstTask;

  if (shouldSendFirstTaskEmail(firstTask)) {
    const templateId = CONSTANTS.EMAIL_TEMPLATE_IDS.DEAL_SUBMITTED_COMPLETE_TASK_MATCH_OR_CREATE_PARTIES;

    const { email: sendToEmailAddress } = await api.findOneTeam(team.id);

    const {
      submissionType,
      submissionDate,
      owningBank,
    } = dealSnapshot.details;

    const {
      'supplier-name': exporterName,
    } = dealSnapshot.submissionDetails;

    const formattedSubmissionDate = moment(formattedTimestamp(submissionDate)).format('Do MMMM YYYY');

    const emailVariables = {
      exporterName,
      submissionType,
      submissionDate: formattedSubmissionDate,
      bank: owningBank.name,
    };

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

const sendDealSubmitEmails = async (deal) => {
  if (!deal) {
    return false;
  }

  // send email for the first task
  const firstTaskEmail = await sendFirstTaskEmail(deal);

  const emailAcknowledgementMIA = await sendMiaAcknowledgement(deal);

  return {
    firstTaskEmail,
    emailAcknowledgementMIA,
  };
};

module.exports = {
  shouldSendFirstTaskEmail,
  sendFirstTaskEmail,
  sendDealSubmitEmails,
  sendMiaAcknowledgement,
  generateFacilitiesListString,
};
