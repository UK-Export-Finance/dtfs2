const api = require('../api');
const CONSTANTS = require('../../constants');
const sendTfmEmail = require('./send-tfm-email');
const { generateTaskEmailVariables } = require('../helpers/generate-task-email-variables');

const sendUpdatedTaskEmail = async (task, deal, urlOrigin) => {
  let templateId;
  let sendToEmailAddress;
  let team;

  const { dealSnapshot } = deal;
  const {
    _id: dealId,
    submissionDetails,
    details,
  } = dealSnapshot;

  const { 'supplier-name': exporterName } = submissionDetails;
  const { ukefDealId } = details;

  let emailVariables = generateTaskEmailVariables(
    urlOrigin,
    task,
    dealId,
    exporterName,
    ukefDealId,
  );

  switch (task.title) {
    case CONSTANTS.TASKS.AIN_AND_MIA.GROUP_1.CREATE_OR_LINK_SALESFORCE:
      templateId = CONSTANTS.EMAIL_TEMPLATE_IDS.TASK_SALEFORCE_NEW_DEAL;

      emailVariables = {
        exporterName,
        ukefDealId,
      };
      break;

    case CONSTANTS.TASKS.MIA_GROUP_1_TASKS.FILE_ALL_DEAL_EMAILS:
      templateId = CONSTANTS.EMAIL_TEMPLATE_IDS.TASK_READY_TO_START;
      break;

    case CONSTANTS.TASKS.MIA_GROUP_1_TASKS.CREATE_CREDIT_ANALYSIS_DOCUMENT:
      templateId = CONSTANTS.EMAIL_TEMPLATE_IDS.TASK_READY_TO_START;
      break;

    case CONSTANTS.TASKS.MIA_GROUP_2_TASKS.COMPLETE_ADVERSE_HISTORY_CHECK:
      templateId = CONSTANTS.EMAIL_TEMPLATE_IDS.TASK_READY_TO_START;
      break;

    case CONSTANTS.TASKS.MIA_GROUP_3_TASKS.CHECK_EXPOSURE:
      templateId = CONSTANTS.EMAIL_TEMPLATE_IDS.TASK_READY_TO_START;
      break;

    case CONSTANTS.TASKS.MIA_GROUP_3_TASKS.GIVE_EXPORTER_A_CREDIT_RATING:
      templateId = CONSTANTS.EMAIL_TEMPLATE_IDS.TASK_READY_TO_START;
      break;

    case CONSTANTS.TASKS.MIA_GROUP_3_TASKS.COMPLETE_CREDIT_ANALYSIS:
      templateId = CONSTANTS.EMAIL_TEMPLATE_IDS.TASK_READY_TO_START;
      break;

    case CONSTANTS.TASKS.MIA_GROUP_4_TASKS.CHECK_THE_CREDIT_ANALYSIS:
      templateId = CONSTANTS.EMAIL_TEMPLATE_IDS.TASK_READY_TO_START;
      break;

    case CONSTANTS.TASKS.MIA_GROUP_4_TASKS.COMPLETE_RISK_ANALYSIS:
      templateId = CONSTANTS.EMAIL_TEMPLATE_IDS.TASK_READY_TO_START;
      break;

    case CONSTANTS.TASKS.MIA_GROUP_4_TASKS.APPROVE_OR_DECLINE_THE_DEAL:
      templateId = CONSTANTS.EMAIL_TEMPLATE_IDS.TASK_READY_TO_START;
      break;

    default:
  }

  if (templateId) {
    team = await api.findOneTeam(task.team && task.team.id);
    sendToEmailAddress = team.email;

    return sendTfmEmail(
      templateId,
      sendToEmailAddress,
      emailVariables,
      deal,
    );
  }

  return null;
};

module.exports = sendUpdatedTaskEmail;
