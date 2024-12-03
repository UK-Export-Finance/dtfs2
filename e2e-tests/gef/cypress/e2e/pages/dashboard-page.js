const dashboardPage = {
  createNewSubmission: () => cy.get('[data-cy="CreateNewSubmission"]'),
  mandatoryCriteriaYes: () => cy.get('[data-cy="mandatory-criteria-yes"]'),
  gefSubmission: () => cy.get('[data-cy="scheme-gef"]'),
  internalRefName: () => cy.get('[data-cy="internal-ref"]'),
  dashboardHome: () => cy.get('[data-cy="dashboard"]'),
};

export default dashboardPage;
