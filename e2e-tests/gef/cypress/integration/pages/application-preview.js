/* eslint-disable no-undef */
const applicationPreview = {
  backLink: () => cy.get('[data-cy="back-link"]'),
  bankReference: () => cy.get('[data-cy="bank-reference"]'),

  comments: () => cy.get('[data-cy="latest-comment"]'),

  unissuedFacilitiesHeader: () => cy.get('[data-cy="update-unissued-header"]'),
  unissuedFacilitiesReviewLink: () => cy.get('[data-cy="update-unissued-link"]'),

  reviewFacilityStage: () => cy.get('[data-cy="update-unissued-stage"]'),
  updatedUnissuedFacilitiesHeader: () => cy.get('[data-cy="changed-unissued-header"]'),
  updatedUnissuedFacilitiesList: () => cy.get('[data-cy="unissued-to-issued-facilities-list"]'),

  applicationPreviewPage: () => cy.get('[data-cy="application-preview-page"]'),
  captionHeading: () => cy.get('[data-cy="heading-caption"]'),
  mainHeading: () => cy.get('[data-cy="main-heading"]'),

  exporterHeading: () => cy.get('[data-cy="exporter-heading'),
  exporterSummaryList: () => cy.get('[data-cy="exporter-summary-list'),

  automaticCoverHeading: () => cy.get('[data-cy="automatic-cover-heading"]'),
  automaticCoverSummaryList: () => cy.get('[data-cy="automatic-cover-summary-list"]'),

  facilityHeading: () => cy.get('[data-cy="facility-heading"]'),
  facilitySummaryList: () => cy.get('[data-cy="facility-summary-list"]'),

  submitHeading: () => cy.get('[data-cy="submit-heading"]'),
  submitButton: () => cy.get('[data-cy="submit-button"]'),
  returnButton: () => cy.get('[data-cy="return-button"]'),
};

export default applicationPreview;
