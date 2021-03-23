const partial = {
  tasksLink: () => cy.get('[data-cy="tasks-link"]'),
  dealLink: () => cy.get('[data-cy="deal-link"]'),
  partiesLink: () => cy.get('[data-cy="parties-link"]'),
  documentsLink: () => cy.get('[data-cy="documents-link"]'),
  activityLink: () => cy.get('[data-cy="activity-link"]'),
  underwritingLink: () => cy.get('[data-cy="underwriting-link"]'),
  linkedDealsLink: () => cy.get('[data-cy="linked-deals-link"]'),
};

module.exports = partial;
