const dashboardPage = {
  createNewSubmission: () => cy.get('[data-cy="CreateNewSubmission"]'),
  mandatoryCriteriaYes: () => cy.get('[data-cy="mandatory-criteria-yes"]'),
  gefSubmission: () => cy.get('[data-cy="scheme-gef"]'),
  internalRefName: () => cy.get('[data-cy="internal-ref"]'),
  dashboardHome: () => cy.get('[data-cy="header-dashboard-link"]'),
};

export default dashboardPage;
