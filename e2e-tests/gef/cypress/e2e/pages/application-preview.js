/* eslint-disable no-undef */
const applicationPreview = {
  backLink: () => cy.get('[data-cy="back-link"]'),
  bankReference: () => cy.get('[data-cy="bank-reference"]'),

  comments: () => cy.get('[data-cy="latest-comment"]'),

  ukefReview: () => cy.get('[data-cy="ukef-review"]'),
  ukefReviewLink: () => cy.get('[data-cy="ukef-review-link"]'),
  ukefReviewHeading: () => cy.get('[data-cy="ukef-review-decision-heading"]'),

  reviewDecision: () => cy.get('[data-cy="review-decision-text"]'),
  reviewDecisionTrue: () => cy.get('[data-cy="review-decision-true"]'),
  reviewDecisionContinue: () => cy.get('[data-cy="continue-button"]'),
  reviewDecisionError: () => cy.get('[data-cy="decision-error"]'),
  errorSummary: () => cy.get('[data-cy="error-summary"]'),

  miaStageChecker: () => cy.get('[data-cy="update-mia-stage"]'),

  acceptMIADecision: () => cy.get('[data-cy="accept-mia-conditions"]'),

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
  automaticCoverCriteria: () => cy.get('[data-cy="automatic-cover-criteria"]'),

  facilityHeading: () => cy.get('[data-cy="facility-heading"]'),
  facilityGuidance: () => cy.get('[data-cy="facility-guidance"]'),
  facilitySummaryList: () => cy.get('[data-cy="facility-summary-list"]'),
  facilitySummaryListRowKey: (tableNum, rowNum) => cy.get('[data-cy="facility-summary-list"]').eq(tableNum).find('.govuk-summary-list__row').eq(rowNum)
    .find('.govuk-summary-list__key'),
  facilitySummaryListRowValue: (tableNum, rowNum) => cy.get('[data-cy="facility-summary-list"]').eq(tableNum).find('.govuk-summary-list__row').eq(rowNum)
    .find('.govuk-summary-list__value'),
  facilitySummaryListRowAction: (tableNum, rowNum) => cy.get('[data-cy="facility-summary-list"]').eq(tableNum).find('.govuk-summary-list__row').eq(rowNum)
    .find('.govuk-summary-list__actions'),

  supportingInfoListRowKey: (tableNum, rowNum) => cy.get('[data-cy="supportingInfo-summary-list"]').eq(tableNum).find('.govuk-summary-list__row').eq(rowNum)
    .find('.govuk-summary-list__key'),
  supportingInfoListRowValue: (tableNum, rowNum) => cy.get('[data-cy="supportingInfo-summary-list"]').eq(tableNum).find('.govuk-summary-list__row').eq(rowNum)
    .find('.govuk-summary-list__value'),
  supportingInfoListRowAction: (tableNum, rowNum) => cy.get('[data-cy="supportingInfo-summary-list"]').eq(tableNum).find('.govuk-summary-list__row').eq(rowNum)
    .find('.govuk-summary-list__actions'),

  submitHeading: () => cy.get('[data-cy="submit-heading"]'),
  submitButton: () => cy.get('[data-cy="submit-button"]'),
  submitButtonPostApproval: () => cy.get('[data-cy="submit-ukef-approved-application-to-checker"]'),
  returnButton: () => cy.get('[data-cy="return-button"]'),
};

export default applicationPreview;
