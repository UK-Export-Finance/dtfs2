/* eslint-disable no-undef */
const submitToUkefConfirmation = {
  confirmationPanelTitle: () => cy.get('[data-cy="ukef-submission-confirmation-title"]'),
  dashboardLink: () => cy.get('[data-cy="dashboard-link"]'),
};

export default submitToUkefConfirmation;
