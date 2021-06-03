const CONSTANTS = require('../../constants');
const sendTfmEmail = require('./send-tfm-email');
const { capitalizeFirstLetter } = require('../../utils/string');

const sendIssuedFacilityReceivedEmail = async (deal, facility) => {
  const { dealSnapshot } = deal;
  const { details, submissionDetails } = dealSnapshot;

  const {
    bankSupplyContractID: bankReferenceNumber,
    ukefDealId: ukefDealID,
    maker,
    submissionType,
  } = details;

  const shouldSendEmail = (
    submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.AIN
    || submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.MIN);

  if (shouldSendEmail) {
    const {
      'supplier-name': exporterName,
    } = submissionDetails;

    const {
      firstname: recipientName,
      email: sendToEmailAddress,
    } = maker;

    const templateId = CONSTANTS.EMAIL_TEMPLATE_IDS.ISSUED_FACILITY_RECEIVED;

    const {
      facilityType,
      ukefFacilityID,
    } = facility;

    const emailVariables = {
      recipientName,
      exporterName,
      bankReferenceNumber,
      ukefDealID,
      facilityType: capitalizeFirstLetter(facilityType),
      ukefFacilityID,
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

module.exports = sendIssuedFacilityReceivedEmail;
