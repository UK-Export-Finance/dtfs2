const sendEmail = require('../../../reference-data/send-email');

const sendEmailsToOwningBanks = async (templateId, emailVariables, owningBankEmails) => {
  await owningBankEmails.forEach(async (email) => {
    await sendEmail(templateId, email, emailVariables);
  });
};

const abandonedDealEmails = async (baseEmailVariables, emailAddresses) => {
  const EMAIL_TEMPLATE_ID = '8a5d4158-d944-4ecb-98a0-42a7f79a8174';

  const emailVariables = {
    ...baseEmailVariables,
  };

  if (!emailVariables.supplierName) {
    // business requirement to display something to the user.
    emailVariables.supplierName = 'null';
  }

  await sendEmailsToOwningBanks(EMAIL_TEMPLATE_ID, emailVariables, emailAddresses);
};

const statusUpdateEmails = async (baseEmailVariables, deal, emailAddresses) => {
  const EMAIL_TEMPLATE_ID = '718beb52-474e-4f34-a8d7-ab0e48cdffce';

  const { submissionType } = deal;

  const emailVariables = {
    ...baseEmailVariables,
    submissionType,
  };

  await sendEmailsToOwningBanks(EMAIL_TEMPLATE_ID, emailVariables, emailAddresses);
};

const send = async (deal, fromStatus, user) => {
  const { submissionType, bankInternalRefName, maker, status: currentStatus } = deal;

  const { 'supplier-name': supplierName } = deal.submissionDetails;

  const { firstname, surname, username } = user;

  const updatedByName = `${firstname} ${surname}`;
  const updatedByEmail = username;

  const baseEmailVariables = {
    firstName: maker.firstname,
    surname: maker.surname,
    submissionType,
    supplierName,
    bankInternalRefName,
    currentStatus,
    previousStatus: fromStatus,
    updatedByName,
    updatedByEmail,
  };

  const emailAddresses = deal.bank.emails;

  if (currentStatus === 'Abandoned') {
    await abandonedDealEmails(baseEmailVariables, emailAddresses);
  } else {
    await statusUpdateEmails(baseEmailVariables, deal, emailAddresses);
  }
};

module.exports = send;
