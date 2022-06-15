const api = require('../api');
const sendTfmEmail = require('../controllers/send-tfm-email');
const CONSTANTS = require('../../constants');
const { amendmentEmailVariables } = require('../emails/amendments/automatic-approval-email-variables');

const amendmentEmailEligible = (amendment) => {
  if (amendment && (amendment?.automaticApprovalEmail)) {
    return true;
  }
  return false;
};

const sendAutomaticAmendmentEmail = async (amendmentVariables) => {
  const { user, dealSnapshot, amendment, facilityId, amendmentId } = amendmentVariables;

  const emailResponse = await sendTfmEmail(
    CONSTANTS.EMAIL_TEMPLATE_IDS.AUTOMATIC_AMENDMENT,
    user.email,
    amendmentEmailVariables(amendment, dealSnapshot, user),
  );
  // if successful, then updates flag to say email has been sent
  if (emailResponse) {
    await api.updateFacilityAmendment(facilityId, amendmentId, { automaticApprovalEmailSent: true });
  }
};

module.exports = { amendmentEmailEligible, sendAutomaticAmendmentEmail };
