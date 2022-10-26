const page = {
  visit: () => cy.visit('/dashboard'),
  createNewSubmission: () => cy.get('[data-cy="CreateNewSubmission"]'),
  mandatoryCriteriaYes: () => cy.get('[data-cy="mandatory-criteria-yes"]'),
  continueButton: () => cy.get('[data-cy="continue-button"]'),
};

module.exports = page;
