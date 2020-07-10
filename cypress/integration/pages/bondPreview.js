const page = {
  saveGoBackButton: () => cy.get('[data-cy="save-go-back-button"]'),
  submissionDetails: () => cy.get('[data-cy="bond-submission-details"]'),
};

module.exports = page;
