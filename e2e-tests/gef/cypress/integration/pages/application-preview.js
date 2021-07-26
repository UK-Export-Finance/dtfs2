/* eslint-disable no-undef */
const applicationPreview = {
  backLink: () => cy.get('[data-cy="back-link"]'),
  bankReference: () => cy.get('[data-cy="bank-reference"]'),
  applicationBanner: () => cy.get('[data-cy="application-banner"]'),
  status: () => cy.get('[data-cy="status"]'),
  product: () => cy.get('[data-cy="product"]'),
  dateCreated: () => cy.get('[data-cy="date-created"]'),
  submissionType: () => cy.get('[data-cy="submission-type"]'),
  createdBy: () => cy.get('[data-cy="created-by"]'),
  exporter: () => cy.get('[data-cy="exporter"]'),
  checkedBy: () => cy.get('[data-cy="checked-by"]'),

  task: () => cy.get('[data-cy="task"]'),
  comments: () => cy.get('[data-cy="latest-comment"]'),

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
