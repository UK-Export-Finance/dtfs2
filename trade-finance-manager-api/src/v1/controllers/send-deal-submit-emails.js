const api = require('../api');
const CONSTANTS = require('../../constants');
const { getFirstTask } = require('../helpers/tasks');
const {
  generateFacilityLists,
  generateFacilitiesListString,
} = require('../helpers/notify-template-formatters');
const { generateTaskEmailVariables } = require('../helpers/generate-task-email-variables');
const sendTfmEmail = require('./send-tfm-email');

// make sure the first task is `Match or Create Parties`
// if the first task changes in the future, we might not want to send an email.
const shouldSendFirstTaskEmail = (firstTask) =>
  (firstTask.title === CONSTANTS.TASKS.AIN_AND_MIA.GROUP_1.MATCH_OR_CREATE_PARTIES);

const sendFirstTaskEmail = async (deal) => {
  const {
    _id: dealId,
    ukefDealId,
    exporter,
    tfm,
  } = deal;

  const { tasks } = tfm;

  const firstTask = getFirstTask(tasks);

  if (shouldSendFirstTaskEmail(firstTask)) {
    const urlOrigin = process.env.TFM_URI;
    const templateId = CONSTANTS.EMAIL_TEMPLATE_IDS.TASK_READY_TO_START;

    const { team } = firstTask;
    const { email: sendToEmailAddress } = await api.findOneTeam(team.id);

    const emailVariables = generateTaskEmailVariables(
      urlOrigin,
      firstTask,
      dealId,
      exporter.companyName,
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

// TODO: is there  a unit test for this
const sendMiaAcknowledgement = async (deal) => {
  const {
    ukefDealId,
    submissionType,
    bankReferenceNumber,
    maker,
    exporter,
    facilities,
  } = deal;

  if (submissionType !== CONSTANTS.DEALS.SUBMISSION_TYPE.MIA) {
    return null;
  }

  const {
    firstname: recipientName,
    email: sendToEmailAddress,
  } = maker;

  const templateId = CONSTANTS.EMAIL_TEMPLATE_IDS.DEAL_MIA_RECEIVED;

  const bonds = facilities.filter((f) => f.facilityType === CONSTANTS.FACILITIES.FACILITY_TYPE.BOND);
  const loans = facilities.filter((f) => f.facilityType === CONSTANTS.FACILITIES.FACILITY_TYPE.LOAN);

  const bssList = generateFacilitiesListString(bonds);
  const ewcsList = generateFacilitiesListString(loans);

  const emailVariables = {
    recipientName,
    exporterName: exporter.companyName,
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

const generateAinMinEmailVariables = (deal, facilityLists) => {
  const {
    ukefDealId,
    bankReferenceNumber,
    submissionType,
    maker,
    exporter,
  } = deal;

  const { firstname, surname } = maker;

  const emailVariables = {
    firstname,
    surname,
    exporterName: exporter.companyName,
    bankReferenceNumber,
    ukefDealId,
    isAin: submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.AIN ? 'yes' : 'no',
    isMin: submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.MIN ? 'yes' : 'no',
    issuedFacilitiesList: facilityLists.issued,
    showIssuedHeader: facilityLists.issued ? 'yes' : 'no',
    unissuedFacilitiesList: facilityLists.unissued,
    showUnissuedHeader: facilityLists.unissued ? 'yes' : 'no',
  };

  return emailVariables;
};

const sendAinMinIssuedFacilitiesAcknowledgement = async (deal) => {
  const {
    dealType,
    submissionType,
    maker,
    facilities,
  } = deal;

  if (submissionType !== CONSTANTS.DEALS.SUBMISSION_TYPE.MIN
    && submissionType !== CONSTANTS.DEALS.SUBMISSION_TYPE.AIN) {
    return null;
  }

  const facilityLists = generateFacilityLists(dealType, facilities);

  if (!facilityLists.issued) {
    return null;
  }

  const { email: sendToEmailAddress } = maker;

  const templateId = CONSTANTS.EMAIL_TEMPLATE_IDS.DEAL_SUBMIT_MIN_AIN_FACILITIES_ISSUED;

  const emailVariables = generateAinMinEmailVariables(deal, facilityLists);

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

  const firstTaskEmail = await sendFirstTaskEmail(deal);
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
  generateFacilityLists,
  generateAinMinEmailVariables,
  sendAinMinIssuedFacilitiesAcknowledgement,
};
