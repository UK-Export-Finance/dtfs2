const searchUtilisationReportsFormPage = {
  visit: () => cy.visit('/utilisation-reports/find-reports-by-year'),
  heading: () => cy.get(`[data-cy="find-reports-by-year-heading"]`),
  bankRadioButton: (bankId) => cy.get(`[data-cy="${bankId}-radio"]`),
  yearInput: () => cy.get(`[data-cy="year-input"]`),
  yearInputDropdownId: () => cy.get(`[data-cy="year-input"]`).invoke('attr', 'list'),
  continueButton: () => cy.get(`[data-cy="continue-button"]`),
};

const searchUtilisationReportsResultsPage = {
  heading: () => cy.get(`[data-cy="utilisation-reports-by-bank-and-year-heading"]`),
  table: () => cy.get(`[data-cy="utilisation-reports-by-bank-and-year-table"]`),
  noReportsText: () => cy.get(`[data-cy="utilisation-reports-by-bank-and-year-text"]`),
};

module.exports = { searchUtilisationReportsFormPage, searchUtilisationReportsResultsPage };
