const page = {
  visit: (deal) => cy.visit(`/contract/${deal._id}/delete`),
  heading: () => cy.get('h1'),
  comments: () => cy.get('[data-cy="comments"]'),
  abandon: () => cy.get('[data-cy="Abandon"]'),
  cancel: () => cy.get('[data-cy="Cancel"]'),

  expectError: (text) => cy.get('.govuk-error-message').contains(text),
};

module.exports = page;
