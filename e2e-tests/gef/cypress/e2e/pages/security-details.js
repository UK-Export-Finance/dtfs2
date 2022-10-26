/* eslint-disable no-undef */
const securityDetails = {
  visit: (id) => cy.visit(`/gef/application-details/${id}/supporting-information/security-details`),
  errorSummary: () => cy.get('[data-cy="error-summary"]'),
  mainHeading: () => cy.get('[data-cy="main-heading"]'),
  form: () => cy.get('[data-cy="form"]'),
  exporterSecurity: () => cy.get('[data-cy="exporter-security"]'),
  facilitySecurity: () => cy.get('[data-cy="facility-security"]'),
  exporterSecurityError: () => cy.get('[data-cy="exporter-security-error"]'),
  facilitySecurityError: () => cy.get('[data-cy="facility-security-error"]'),
  continueButton: () => cy.get('[data-cy="submit-button"]'),
  cancelButton: () => cy.get('[data-cy="cancel-button"]'),
  securityDetailsChangeCta: () => cy.get('[data-cy="security-details-cta"]'),
};

export default securityDetails;
