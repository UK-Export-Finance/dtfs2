const managersDecisionPage = {
  decisionStatusTag: () => cy.get('[data-cy="decision-status-tag"]'),
  decisionMadeBy: () => cy.get('[data-cy="decision-made-by-value"]'),
  decisionDateTime: () => cy.get('[data-cy="date-time-value"]'),
  conditions: () => cy.get('[data-cy="conditions-value"]'),
  internalComments: () => cy.get('[data-cy="internal-comments-value"]'),
};

module.exports = managersDecisionPage;
