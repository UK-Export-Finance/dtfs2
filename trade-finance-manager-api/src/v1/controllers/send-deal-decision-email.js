const CONSTANTS = require('../../constants');
const sendTfmEmail = require('./send-tfm-email');

const sendDealDecisionEmail = async (mappedDeal) => {
  const { tfm } = mappedDeal;

  const {
    bankReferenceNumber,
    ukefDealId,
    maker,
    exporter,
  } = mappedDeal;

  const {
    firstname: recipientName,
    email: sendToEmailAddress,
  } = maker;

  const {
    stage,
    underwriterManagersDecision,
  } = tfm;

  const { comments } = underwriterManagersDecision;

  let templateId;

  const emailVariables = {
    recipientName,
    exporterName: exporter.companyName,
    bankReferenceNumber,
    ukefDealId,
  };

  switch (stage) {
    case CONSTANTS.DEALS.DEAL_STAGE_TFM.UKEF_APPROVED_WITH_CONDITIONS:
      templateId = CONSTANTS.EMAIL_TEMPLATE_IDS.DEAL_MIA_APPROVED_WITH_CONDITIONS;

      emailVariables.conditions = comments;
      break;

    case CONSTANTS.DEALS.DEAL_STAGE_TFM.APPROVED_WITHOUT_CONDITIONS:
      templateId = CONSTANTS.EMAIL_TEMPLATE_IDS.DEAL_MIA_APPROVED_WITHOUT_CONDITIONS;
      break;

    case CONSTANTS.DEALS.DEAL_STAGE_TFM.DECLINED:
      templateId = CONSTANTS.EMAIL_TEMPLATE_IDS.DEAL_MIA_DECLINED;

      emailVariables.reasonForRejection = comments;
      break;

    default:
  }

  await sendTfmEmail(
    templateId,
    sendToEmailAddress,
    emailVariables,
    mappedDeal,
  );
};

module.exports = sendDealDecisionEmail;
