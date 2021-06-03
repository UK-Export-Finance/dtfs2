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
  } = details;

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

  await sendTfmEmail(
    templateId,
    sendToEmailAddress,
    emailVariables,
    deal,
  );
};

module.exports = sendIssuedFacilityReceivedEmail;
