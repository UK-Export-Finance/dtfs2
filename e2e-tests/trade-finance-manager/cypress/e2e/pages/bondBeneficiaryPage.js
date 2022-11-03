const buyerPartyPage = {
  errorSummary: () => cy.get('[data-cy="error-summary"]'),
  urnInput: (index) => cy.get(`[data-cy="urn-input-${index}"]`),
  urnError: (index) => cy.get(`[data-cy="partyUrn--inline-error-${index}"]`),
  heading: () => cy.get('[data-cy="edit-heading"]'),
  saveButton: () => cy.get('[data-cy="save-button"]'),
  closeLink: () => cy.get('[data-cy="close-link"]'),
  uniqueRef: () => cy.get('[data-cy="bond-beneficiary-unique-ref"]'),
};

module.exports = buyerPartyPage;
