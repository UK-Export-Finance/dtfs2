const page = {
  visit: (deal) => cy.visit(`/contract/${deal._id}/return-to-maker`),
  comments: () => cy.get('[data-cy="comments"]'),
  cancel: () => cy.get('[data-cy="Cancel"]'),

  expectError: (text) => cy.get('.govuk-error-message').contains(text),
};

module.exports = page;
