const page = {
  visit: (deal) => cy.visit(`/contract/${deal._id}/confirm-submission`),
  confirmSubmit: () => cy.get('[data-cy="confirmSubmit"]').get('#confirmSubmit'),
  acceptAndSubmit: () => cy.get('[data-cy="AcceptAndSubmit"]'),
  cancel: () => cy.get('[data-cy="Cancel"]'),

  expectError: (text) => cy.get('.govuk-error-summary').contains(text),
};

module.exports = page;
