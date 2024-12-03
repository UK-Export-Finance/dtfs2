const page = {
  visit: () => cy.visit('/dashboard'),
  createNewSubmission: () => cy.get('[data-cy="CreateNewSubmission"]'),
  mandatoryCriteriaYes: () => cy.get('[data-cy="mandatory-criteria-yes"]'),
};

module.exports = page;
