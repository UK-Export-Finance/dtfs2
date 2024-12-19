const dashboardPage = {
  createNewSubmission: () => cy.get('[data-cy="CreateNewSubmission"]'),
  mandatoryCriteriaYes: () => cy.get('[data-cy="mandatory-criteria-yes"]'),
  gefSubmission: () => cy.get('[data-cy="scheme-gef"]'),
  internalRefName: () => cy.get('[data-cy="internal-ref"]'),
  dashboardHome: () => cy.get('[data-cy="dashboard"]'),
  rowIndex: {
    link: (AINdealId, index = 1) => cy.get(`[data-cy*="deal__link--index--${index} deal__link--${AINdealId}"]`),
  },
};

export default dashboardPage;
