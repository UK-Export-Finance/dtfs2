const checkDetailsPage = {
  reasonResponse: () => cy.get('[data-cy="reason-response"]'),
  bankRequestDateResponse: () => cy.get('[data-cy="bank-request-date-response"]'),
  effectiveFromResponse: () => cy.get('[data-cy="effective-from-response"]'),
  reasonLink: () => cy.get('[data-cy="reason-link"]'),
  bankRequestDateLink: () => cy.get('[data-cy="bank-request-date-link"]'),
  effectiveFromLink: () => cy.get('[data-cy="effective-from-link"]'),
  dealDeletionButton: () => cy.get('[data-cy="delete-button"]'),
  returnLink: () => cy.get('[data-cy="return-link"]'),
};

module.exports = checkDetailsPage;
