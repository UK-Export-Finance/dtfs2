/* eslint-disable no-undef */
const applicationDetails = {
  applicationDetailsPage: () => cy.get('[data-cy="application-details-page"]'),
  applicationBanner: () => cy.get('[data-cy="application-banner"]'),
  bankRefName: () => cy.get('[data-cy="bank-ref-name"]'),
  abandonLink: () => cy.get('[data-cy="abandon-link"]'),
  captionHeading: () => cy.get('[data-cy="heading-caption"]'),
  mainHeading: () => cy.get('[data-cy="main-heading"]'),
  exporterHeading: () => cy.get('[data-cy="exporter-heading"]'),
  exporterStatus: () => cy.get('[data-cy="exporter-status"]'),
  exporterDetailsLink: () => cy.get('[data-cy="exporter-details-link"]'),
  exporterSummaryList: () => cy.get('[data-cy="exporter-summary-list"]'),

  automaticCoverHeading: () => cy.get('[data-cy="automatic-cover-heading"]'),
  automaticCoverStatus: () => cy.get('[data-cy="automatic-cover-status"]'),
  automaticCoverDetailsLink: () => cy.get('[data-cy="automatic-cover-details-link"]'),
  automaticCoverSummaryList: () => cy.get('[data-cy="automatic-cover-summary-list"]'),

  facilityHeading: () => cy.get('[data-cy="facility-heading"]'),
  facilityStatus: () => cy.get('[data-cy="facility-status"]'),
  addCashFacilityButton: () => cy.get('[data-cy="add-cash-facility-button"]'),
  addContingentFacilityButton: () => cy.get('[data-cy="add-contingent-facility-button"]'),
  facilitySummaryList: () => cy.get('[data-cy="facility-summary-list"]'),

  submitHeading: () => cy.get('[data-cy="submit-heading"]'),
  submitButton: () => cy.get('[data-cy="submit-button"]'),
  submitValidationText: () => cy.get('[data-cy="submit-validation-text"]'),
};

export default applicationDetails;
