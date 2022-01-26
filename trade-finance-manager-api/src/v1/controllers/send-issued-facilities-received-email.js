const CONSTANTS = require('../../constants');
const sendTfmEmail = require('./send-tfm-email');
const { capitalizeFirstLetter } = require('../../utils/string');

const generateIssuedFacilitiesListString = (facilities) => {
  let result;

  facilities.forEach((facility, index) => {
    const { type, ukefFacilityId } = facility;

    const fType = capitalizeFirstLetter(type);
    const listItem = `- ${fType} facility with UKEF facility reference: ${ukefFacilityId}`;

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
    name,
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
      name,
      ukefDealID,
      facilitiesList: generateIssuedFacilitiesListString(updatedFacilities),
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
  generateIssuedFacilitiesListString,
  sendIssuedFacilitiesReceivedEmail,
};
