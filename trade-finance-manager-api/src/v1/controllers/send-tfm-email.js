const api = require('../api');
const now = require('../../now');

const sendTfmEmail = async (
  templateId,
  sendToEmailAddress,
  emailVariables,
  deal,
) => {
  const emailResponse = await api.sendEmail(
    templateId,
    sendToEmailAddress,
    emailVariables,
  );

  // update deal history
  const dealId = deal.dealSnapshot._id; // eslint-disable-line no-underscore-dangle
  const newHistoryObject = {
    recipient: sendToEmailAddress,
    templateId,
    timestamp: now(),
  };

  const emailHistory = deal.tfm.history.emails || [];

  const updatedHistory = {
    ...deal.tfm.history,
    emails: [
      ...emailHistory,
      newHistoryObject,
    ],
  };

  const tfmDealUpdate = {
    tfm: {
      ...deal.tfm,
      history: updatedHistory,
    },
  };

  await api.updateDeal(dealId, tfmDealUpdate);

  return emailResponse;
};

module.exports = sendTfmEmail;
