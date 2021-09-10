/* eslint-disable no-undef */
const securityDetails = {
  visit: (id) => cy.visit(`/gef/application-details/${id}/supporting-information/security-details`),
  errorSummary: () => cy.get('[data-cy="error-summary"]'),
  mainHeading: () => cy.get('[data-cy="main-heading"]'),
  form: () => cy.get('[data-cy="form"]'),
  exporterSecurity: () => cy.get('[data-cy="exporter-security"]'),
  applicationSecurity: () => cy.get('[data-cy="application-security"]'),
  exporterSecurityError: () => cy.get('[data-cy="exporter-security-error"]'),
  applicationSecurityError: () => cy.get('[data-cy="application-security-error"]'),
  continueButton: () => cy.get('[data-cy="submit-button"]'),
  cancelButton: () => cy.get('[data-cy="cancel-button"]'),
};

export default securityDetails;
