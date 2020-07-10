const page = {
  submissionDetails: () => cy.get('[data-cy="loan-submission-details"]'),
  saveGoBackButton: () => cy.get('[data-cy="save-go-back-button"]'),
};

module.exports = page;
