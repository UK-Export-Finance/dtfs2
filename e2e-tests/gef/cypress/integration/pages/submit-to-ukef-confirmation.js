/* eslint-disable no-undef */
const submitToUkefConfirmation = {
  confirmationPanelTitle: () => cy.get('[data-cy="submit-confirmation-title"]'),
  confirmationFacilitiesPanelTitle: () => cy.get('[data-cy="submit-facilities-confirmation-title"]'),
  confirmationText: () => cy.get('[data-cy="confirmation-text"]'),
  dashboardLink: () => cy.get('[data-cy="dashboard-link"]'),
};

export default submitToUkefConfirmation;
