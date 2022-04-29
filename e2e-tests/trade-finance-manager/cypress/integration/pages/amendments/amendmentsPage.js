const amendmentsPage = {
  addAmendmentButton: () => cy.get('[data-cy="add-amendment-button"]'),
  continueAmendmentButton: () => cy.get('[data-cy="continue-amendment-button"]'),
};

module.exports = amendmentsPage;
