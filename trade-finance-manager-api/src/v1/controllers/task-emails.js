const api = require('../api');
const CONSTANTS = require('../../constants');
const sendTfmEmail = require('./send-tfm-email');
const { generateTaskEmailVariables } = require('../helpers/generate-task-email-variables');

const sendUpdatedTaskEmail = async (task, deal, urlOrigin) => {
  try {
    const { _id: dealId, ukefDealId, exporter } = deal;
    const templateId = CONSTANTS.EMAIL_TEMPLATE_IDS.TASK_READY_TO_START;

    const emailVariables = generateTaskEmailVariables(urlOrigin, task, dealId, exporter.companyName, ukefDealId);

    const team = await api.findOneTeam(task.team && task.team.id);
    const sendToEmailAddress = team.email;

    return sendTfmEmail(templateId, sendToEmailAddress, emailVariables);
  } catch (err) {
    console.error('TFM-API - Error sending updated task email', { err });
    return null;
  }
};

module.exports = sendUpdatedTaskEmail;
