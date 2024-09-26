const reasonForCancellingPage = {
  reasonForCancellingTextBox: () => cy.get('[data-cy="reason-for-cancelling-text-box"]'),
  reasonForCancellingError: () => cy.get('[data-cy="reason-for-cancelling-inline-error"]'),
};

module.exports = reasonForCancellingPage;
