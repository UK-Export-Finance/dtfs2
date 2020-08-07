const sendEmail = require('../../email');

const sendStatusUpdateEmails = async (deal, fromStatus, user) => {
  const {
    submissionType,
    bankSupplyContractID,
    status: currentStatus,
    maker,
  } = deal.details;

  const {
    'supplier-name': supplerName,
  } = deal.submissionDetails;

  const {
    firstname,
    surname,
    username,
  } = user;

  const updatedByName = `${firstname} ${surname}`;
  const updatedByEmail = username;

  const EMAIL_TEMPLATE_ID = '718beb52-474e-4f34-a8d7-ab0e48cdffce';

  const emailVariables = {
    firstName: maker.firstname,
    surname: maker.surname,
    submissionType,
    supplerName,
    bankSupplyContractID,
    currentStatus,
    previousStatus: fromStatus,
    updatedByName,
    updatedByEmail,
  };

  if (deal.details
    && deal.details.owningBank
    && deal.details.owningBank.emails
    && deal.details.owningBank.emails.length
  ) {
    deal.details.owningBank.emails.forEach(async (email) => {
      await sendEmail(
        EMAIL_TEMPLATE_ID,
        email,
        emailVariables,
      );
    });
  }
};

module.exports = sendStatusUpdateEmails;
