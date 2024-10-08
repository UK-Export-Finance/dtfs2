const page = {
  visit: (deal) => cy.visit(`/contract/${deal._id}/edit-name`),
  additionalRefName: () => cy.get('[data-cy="additionalRefName"]'),
  expectError: (text) => cy.get('.govuk-error-message').contains(text),
};

module.exports = page;
