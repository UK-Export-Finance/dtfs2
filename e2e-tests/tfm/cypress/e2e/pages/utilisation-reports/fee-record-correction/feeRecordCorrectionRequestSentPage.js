const feeRecordCorrectionRequestSentPage = {
  requestSentPanel: () => cy.get(`[data-cy="request-sent-panel"]`),
  otherEmailAddress: (index) => cy.get(`[data-cy="other-email-address-${index}"]`),
  userEmailAddressCopy: () => cy.get(`[data-cy="user-email-address-copy"]`),
  backToPremiumPaymentsButton: () => cy.get(`[data-cy="back-to-premium-payments-button"]`),
};

module.exports = { feeRecordCorrectionRequestSentPage };
