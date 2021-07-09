/* eslint-disable no-undef */
const applicationPreview = {
  dealId: () => cy.get('[data-cy="deal-id"]'),
  status: () => cy.get('[data-cy="status"]'),
  exporter: () => cy.get('[data-cy="exporter"]'),
  bankReference: () => cy.get('[data-cy="bank-reference"]'),
  dateCreated: () => cy.get('[data-cy="date-created"]'),
  createdBy: () => cy.get('[data-cy="created-by"]'),
  checkedBy: () => cy.get('[data-cy="checked-by"]'),
  product: () => cy.get('[data-cy="product"]'),
  submissionType: () => cy.get('[data-cy="submission-type"]'),
  facilitySummary: () => cy.get('[data-cy="facility-summary"]'),

  task: () => cy.get('[data-cy="task"]'),
  comments: () => cy.get('[data-cy="latest-comment"]'),

  applicationPreviewPage: () => cy.get('[data-cy="application-preview-page"]'),
  applicationBanner: () => cy.get('[data-cy="application-banner"]'),
  backLink: () => cy.get('[data-cy="back-link"]'),
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
