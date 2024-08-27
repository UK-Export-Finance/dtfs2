/* eslint-disable no-undef */
const securityDetails = {
  visit: (id) => cy.visit(`/gef/application-details/${id}/supporting-information/security-details`),
  exporterSecurity: () => cy.get('[data-cy="exporter-security"]'),
  facilitySecurity: () => cy.get('[data-cy="facility-security"]'),
  exporterSecurityError: () => cy.get('[data-cy="exporter-security-error"]'),
  facilitySecurityError: () => cy.get('[data-cy="facility-security-error"]'),
  cancelButton: () => cy.get('[data-cy="cancel-button"]'),
  securityDetailsChangeCta: () => cy.get('[data-cy="security-details-cta"]'),
};

export default securityDetails;
