"use strict";
const tslib_1 = require("tslib");
const sendEmail = require('../../email');
const sendEmailsToOwningBanks = (templateId, emailVariables, owningBankEmails) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    owningBankEmails.forEach((email) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        yield sendEmail(templateId, email, emailVariables);
    }));
});
const abandonedDealEmails = (baseEmailVariables, emailAddresses) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const EMAIL_TEMPLATE_ID = '8a5d4158-d944-4ecb-98a0-42a7f79a8174';
    const emailVariables = Object.assign({}, baseEmailVariables);
    if (!emailVariables.supplierName) {
        // business requirement to display something to the user.
        emailVariables.supplierName = 'null';
    }
    yield sendEmailsToOwningBanks(EMAIL_TEMPLATE_ID, emailVariables, emailAddresses);
});
const statusUpdateEmails = (baseEmailVariables, deal, emailAddresses) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const EMAIL_TEMPLATE_ID = '718beb52-474e-4f34-a8d7-ab0e48cdffce';
    const { submissionType } = deal;
    const emailVariables = Object.assign(Object.assign({}, baseEmailVariables), { submissionType });
    yield sendEmailsToOwningBanks(EMAIL_TEMPLATE_ID, emailVariables, emailAddresses);
});
const send = (deal, fromStatus, user) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const { submissionType, bankInternalRefName, maker, status: currentStatus, } = deal;
    const { 'supplier-name': supplierName, } = deal.submissionDetails;
    const { firstname, surname, username, } = user;
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
        yield abandonedDealEmails(baseEmailVariables, emailAddresses);
    }
    else {
        yield statusUpdateEmails(baseEmailVariables, deal, emailAddresses);
    }
});
module.exports = send;
