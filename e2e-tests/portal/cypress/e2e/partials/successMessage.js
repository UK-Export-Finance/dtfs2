const partial = {
  successMessage: () => cy.get('[data-cy="success-message"]'),
  successMessageListItem: () => cy.get('[data-cy="success-message-list-item"]'),
  successMessageLink: () => cy.get('[data-cy="success-message-link"]'),
};

module.exports = partial;
