const submittedForChecking = {
  submittedForCheckingConfirmationPanel: () => cy.get('[data-cy="submitted-for-checking-confirmation-panel"'),
  returnLink: () => cy.get('[data-cy="return-link"]'),
};

module.exports = submittedForChecking;
