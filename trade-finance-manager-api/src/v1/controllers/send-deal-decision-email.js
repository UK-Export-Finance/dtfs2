const api = require('../api');
const CONSTANTS = require('../../constants');
const sendTfmEmail = require('./send-tfm-email');

const sendDealDecisionEmail = async (mappedDeal) => {
  const { tfm } = mappedDeal;
  const { bankInternalRefName, ukefDealId, maker, exporter } = mappedDeal;
  const { firstname: recipientName, email: sendToEmailAddress } = maker;
  const { stage, underwriterManagersDecision } = tfm;
  const { comments } = underwriterManagersDecision;
  const bankId = maker.bank.id;
  const { emails: bankEmails } = await api.findBankById(bankId);
  // get the email address for PIM user
  const { email: pimEmail } = await api.findOneTeam(CONSTANTS.TEAMS.PIM.id);

  let templateId;

  const emailVariables = {
    recipientName,
    exporterName: exporter.companyName,
    bankReferenceNumber: bankInternalRefName,
    ukefDealId,
  };

  switch (stage) {
    case CONSTANTS.DEALS.DEAL_STAGE_TFM.UKEF_APPROVED_WITH_CONDITIONS:
      templateId = CONSTANTS.EMAIL_TEMPLATE_IDS.DEAL_MIA_APPROVED_WITH_CONDITIONS;

      emailVariables.conditions = comments;
      break;

    case CONSTANTS.DEALS.DEAL_STAGE_TFM.UKEF_APPROVED_WITHOUT_CONDITIONS:
      templateId = CONSTANTS.EMAIL_TEMPLATE_IDS.DEAL_MIA_APPROVED_WITHOUT_CONDITIONS;
      break;

    case CONSTANTS.DEALS.DEAL_STAGE_TFM.DECLINED:
      templateId = CONSTANTS.EMAIL_TEMPLATE_IDS.DEAL_MIA_DECLINED;

      emailVariables.reasonForRejection = comments;
      break;

    default:
  }

  await sendTfmEmail(templateId, sendToEmailAddress, emailVariables, mappedDeal);
  // send a copy of the email to bank's general email address
  const bankResponses = await Promise.all(bankEmails.map((email) => sendTfmEmail(templateId, email, emailVariables, mappedDeal)));
  // send a copy of the email to PIM
  await sendTfmEmail(templateId, pimEmail, emailVariables, mappedDeal);

  return bankResponses;
};

module.exports = sendDealDecisionEmail;
