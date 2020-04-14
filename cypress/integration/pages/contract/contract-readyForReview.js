const page = {
  visit: (deal) => cy.visit(`/contract/${deal._id}/ready-for-review`),
  comments: () => cy.get('[data-cy="comments"]'),
  readyForCheckersApproval: () => cy.get('[data-cy="ReadyForCheckersApproval"]'),
  cancel: () => cy.get('[data-cy="Cancel"]'),

  expectError: (text) => cy.get('.govuk-error-message').contains(text),
};

module.exports = page;
