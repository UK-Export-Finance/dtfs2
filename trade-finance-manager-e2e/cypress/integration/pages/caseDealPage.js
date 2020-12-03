const caseDealPage = {
  caseSummary: () => cy.get('[data-cy="case-summary"]'),
  caseSubNavigation: () => cy.get('[data-cy="case-sub-navigation"]'),
  dealBankDetails: () => cy.get('[data-cy="deal-bank-details"]'),
  dealFacilities: () => cy.get('[data-cy="deal-facilities"]'),
  mgaVersion: () => cy.get('[data-cy="mga-version"]')
};

module.exports = caseDealPage;
