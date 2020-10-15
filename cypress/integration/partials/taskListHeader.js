const partial = {
  bondId: () => cy.get('[data-cy="bond-id"]'),
  loanId: () => cy.get('[data-cy="loan-id"]'),
  itemLink: (itemTitle) => cy.get(`[data-cy="task-list-link-${itemTitle}"]`),
  itemStatus: (itemTitle) => cy.get(`[data-cy="task-list-item-${itemTitle}"] [data-cy="status-tag"]`),
  checkYourAnswersLink: () => cy.get('[data-cy="link-check-your-answers"]'),
};

module.exports = partial;
