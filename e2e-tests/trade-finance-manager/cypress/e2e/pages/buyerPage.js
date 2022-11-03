const buyerPartyPage = {
  errorSummary: () => cy.get('[data-cy="error-summary"]'),
  urnInput: () => cy.get('[data-cy="urn-input"]'),
  urnError: () => cy.get('[data-cy="partyUrn--inline-error"]'),
  heading: () => cy.get('[data-cy="edit-heading"]'),
  saveButton: () => cy.get('[data-cy="save-button"]'),
  closeLink: () => cy.get('[data-cy="close-link"]'),
  uniqueRef: () => cy.get('[data-cy="buyer-unique-ref"]'),
};

module.exports = buyerPartyPage;
