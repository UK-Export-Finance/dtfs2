const api = require('../api');
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
  const { bankInternalRefName, ukefDealId: ukefDealID, exporter, submissionType, maker } = deal;

  const shouldSendEmail = (
    submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.AIN
    || submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.MIN);

  if (shouldSendEmail) {
    const bankId = maker.bank.id;
    const { firstname: recipientName, email: makerEmailAddress } = maker;
    const { emails: bankEmails } = await api.findBankById(bankId);
    // get the email address for PIM user
    const { email: pimEmail } = await api.findOneTeam(CONSTANTS.TEAMS.PIM.id);

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
    const pimEmailResponse = await sendTfmEmail(templateId, pimEmail, emailVariables, deal);
    // send a copy of the email to bank's general email address
    const bankResponse = bankEmails.map(async (email) => sendTfmEmail(templateId, email, emailVariables, deal));

    return { makerEmailResponse, pimEmailResponse, bankResponse };
  }

  return null;
};

module.exports = {
  generateIssuedFacilitiesListString,
  sendIssuedFacilitiesReceivedEmail,
};
