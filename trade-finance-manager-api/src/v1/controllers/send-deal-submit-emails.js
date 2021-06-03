const moment = require('moment');
const api = require('../api');
const CONSTANTS = require('../../constants');
const formattedTimestamp = require('../formattedTimestamp');
const { getFirstTask } = require('../helpers/tasks');
const sendTfmEmail = require('./send-tfm-email');

// make sure the first task is `Match or Create Parties`
// if the first task changes in the future, we might not want to send an email.
const shouldSendFirstTaskEmail = (firstTask) =>
  (firstTask.title === CONSTANTS.TASKS.AIN_AND_MIA.GROUP_1.MATCH_OR_CREATE_PARTIES);

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

const sendDealSubmitEmails = async (deal) => {
  if (!deal) {
    return false;
  }

  // send email for the first task
  const firstTaskEmail = await sendFirstTaskEmail(deal);

  return firstTaskEmail;
};

module.exports = {
  shouldSendFirstTaskEmail,
  sendFirstTaskEmail,
  sendDealSubmitEmails,
};
