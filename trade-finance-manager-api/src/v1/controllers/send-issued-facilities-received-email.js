const CONSTANTS = require('../../constants');
const sendTfmEmail = require('./send-tfm-email');
const { capitalizeFirstLetter } = require('../../utils/string');

const generateFacilitiesListString = (facilities) => {
  let result;

  facilities.forEach((facility, index) => {
    const { facilityType, ukefFacilityID } = facility;

    const fType = capitalizeFirstLetter(facilityType);
    const listItem = `- ${fType} facility with UKEF facility reference: ${ukefFacilityID}`;

    if (index === 0) {
      result = listItem;
    } else {
      result += `\n${listItem}`;
    }
  });

  return result;
};

const sendIssuedFacilitiesReceivedEmail = async (deal, updatedFacilities) => {
  const {
    bankReferenceNumber,
    ukefDealId: ukefDealID,
    exporter,
    submissionType,
    maker,
  } = deal;

  const shouldSendEmail = (
    submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.AIN
    || submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.MIN);

  if (shouldSendEmail) {
    const {
      firstname: recipientName,
      email: sendToEmailAddress,
    } = maker;

    const templateId = CONSTANTS.EMAIL_TEMPLATE_IDS.ISSUED_FACILITY_RECEIVED;

    const emailVariables = {
      recipientName,
      exporterName: exporter.companyName,
      bankReferenceNumber,
      ukefDealID,
      facilitiesList: generateFacilitiesListString(updatedFacilities),
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

module.exports = {
  generateFacilitiesListString,
  sendIssuedFacilitiesReceivedEmail,
};
