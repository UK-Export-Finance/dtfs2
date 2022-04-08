const { getCollection } = require('../../drivers/db-client');

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
    bankInternalRefName,
    ukefDealId: ukefDealID,
    exporter,
    submissionType,
    maker,
  } = deal;

  const shouldSendEmail = (
    submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.AIN
    || submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.MIN);

  if (shouldSendEmail) {
    const { firstname: recipientName, email: makerEmailAddress } = maker;

    const collection = await getCollection('tfm-teams');
    const pimUser = await collection.findOne({ id: CONSTANTS.TEAMS.PIM.id });
    // get the email address for PIM user
    const { email: pimEmailAddress } = pimUser;

    const templateId = CONSTANTS.EMAIL_TEMPLATE_IDS.ISSUED_FACILITY_RECEIVED;

    const emailVariables = {
      recipientName,
      exporterName: exporter.companyName,
      bankReferenceNumber: bankInternalRefName,
      ukefDealID,
      facilitiesList: generateIssuedFacilitiesListString(updatedFacilities),
    };

    // send email to maker
    const makerEmailResponse = await sendTfmEmail(templateId, makerEmailAddress, emailVariables, deal);
    // send a copy of the email to PIM
    const pimEmailResponse = await sendTfmEmail(templateId, pimEmailAddress, emailVariables, deal);

    return { makerEmailResponse, pimEmailResponse };
  }

  return null;
};

module.exports = {
  generateIssuedFacilitiesListString,
  sendIssuedFacilitiesReceivedEmail,
};
