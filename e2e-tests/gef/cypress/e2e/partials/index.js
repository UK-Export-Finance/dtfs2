export const backLink = () => cy.get('[data-cy="back-link"]');
export const cancelButton = () => cy.get('[data-cy="cancel-button"]');
export const cancelLink = () => cy.get('[data-cy="cancel-link"]');
export const continueButton = () => cy.get('[data-cy="continue-button"]');
export const errorSummary = () => cy.get('[data-cy="error-summary"]');
export const form = () => cy.get('[data-cy="form"]');
export const headingCaption = () => cy.get('[data-cy="heading-caption"]');
export const mainHeading = () => cy.get('[data-cy="main-heading"]');
export const saveAndReturnButton = () => cy.get('[data-cy="save-and-return-button"]');
export const submitButton = () => cy.get('[data-cy="submit-button"]', { timeout: 60000 });
export const dashboard = () => cy.get('[data-cy="dashboard"]');
export const dashboardSubNavigation = {
  deals: () => cy.get('[data-cy="dashboard-sub-nav-link-deals"]'),
  facilities: () => cy.get('[data-cy="dashboard-sub-nav-link-facilities"]'),
};
