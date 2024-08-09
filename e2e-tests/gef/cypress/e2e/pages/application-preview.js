const cyGetFacilitySummaryListChild = (tableNum, selector) => cy.get('[data-cy="facility-summary-list"]').eq(tableNum).find(selector);
const cyGetFacilitySummaryListValue = (tableNum, actionSelector) =>
  cyGetFacilitySummaryListChild(tableNum, actionSelector).parent().parent().find('.govuk-summary-list__value');
const cyGetFacilitySummaryListKey = (tableNum, actionSelector) =>
  cyGetFacilitySummaryListChild(tableNum, actionSelector).parent().parent().find('.govuk-summary-list__key');

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
  /**
   * @deprecated - use facilitySummaryListTable methods instead
   */
  facilitySummaryListRowKey: (tableNum, rowNum) =>
    cy.get('[data-cy="facility-summary-list"]').eq(tableNum).find('.govuk-summary-list__row').eq(rowNum).find('.govuk-summary-list__key'),
  /**
   * @deprecated - use facilitySummaryListTable methods instead
   */
  facilitySummaryListRowValue: (tableNum, rowNum) =>
    cy.get('[data-cy="facility-summary-list"]').eq(tableNum).find('.govuk-summary-list__row').eq(rowNum).find('.govuk-summary-list__value'),
  /**
   * @deprecated - use facilitySummaryListTable methods instead
   */
  facilitySummaryListRowAction: (tableNum, rowNum) =>
    cy.get('[data-cy="facility-summary-list"]').eq(tableNum).find('.govuk-summary-list__row').eq(rowNum).find('.govuk-summary-list__actions'),

  facilitySummaryListTable: (tableNum) => ({
    nameAction: () => cyGetFacilitySummaryListChild(tableNum, '[data-cy="name-action"]'),
    nameValue: () => cyGetFacilitySummaryListValue(tableNum, '[data-cy="name-action"]'),
    nameKey: () => cyGetFacilitySummaryListKey(tableNum, '[data-cy="name-action"]'),
    ukefFacilityIdAction: () => cyGetFacilitySummaryListChild(tableNum, '[data-cy="ukefFacilityId-action"]'),
    ukefFacilityIdValue: () => cyGetFacilitySummaryListValue(tableNum, '[data-cy="ukefFacilityId-action"]'),
    ukefFacilityIdKey: () => cyGetFacilitySummaryListKey(tableNum, '[data-cy="ukefFacilityId-action"]'),
    hasBeenIssuedAction: () => cyGetFacilitySummaryListChild(tableNum, '[data-cy="hasBeenIssued-action"]'),
    hasBeenIssuedValue: () => cyGetFacilitySummaryListValue(tableNum, '[data-cy="hasBeenIssued-action"]'),
    hasBeenIssuedKey: () => cyGetFacilitySummaryListKey(tableNum, '[data-cy="hasBeenIssued-action"]'),
    issueDateAction: () => cyGetFacilitySummaryListChild(tableNum, '[data-cy="issueDate-action"]'),
    issueDateValue: () => cyGetFacilitySummaryListValue(tableNum, '[data-cy="issueDate-action"]'),
    issueDateKey: () => cyGetFacilitySummaryListKey(tableNum, '[data-cy="issueDate-action"]'),
    coverStartDateAction: () => cyGetFacilitySummaryListChild(tableNum, '[data-cy="coverStartDate-action"]'),
    coverStartDateValue: () => cyGetFacilitySummaryListValue(tableNum, '[data-cy="coverStartDate-action"]'),
    coverStartDateKey: () => cyGetFacilitySummaryListKey(tableNum, '[data-cy="coverStartDate-action"]'),
    coverEndDateAction: () => cyGetFacilitySummaryListChild(tableNum, '[data-cy="coverEndDate-action"]'),
    coverEndDateValue: () => cyGetFacilitySummaryListValue(tableNum, '[data-cy="coverEndDate-action"]'),
    coverEndDateKey: () => cyGetFacilitySummaryListKey(tableNum, '[data-cy="coverEndDate-action"]'),
    isUsingFacilityEndDateAction: () => cyGetFacilitySummaryListChild(tableNum, '[data-cy="isUsingFacilityEndDate-action"]'),
    isUsingFacilityEndDateValue: () => cyGetFacilitySummaryListValue(tableNum, '[data-cy="isUsingFacilityEndDate-action"]'),
    isUsingFacilityEndDateKey: () => cyGetFacilitySummaryListKey(tableNum, '[data-cy="isUsingFacilityEndDate-action"]'),
    facilityEndDateAction: () => cyGetFacilitySummaryListChild(tableNum, '[data-cy="facilityEndDate-action"]'),
    facilityEndDateValue: () => cyGetFacilitySummaryListValue(tableNum, '[data-cy="facilityEndDate-action"]'),
    facilityEndDateKey: () => cyGetFacilitySummaryListKey(tableNum, '[data-cy="facilityEndDate-action"]'),
    bankReviewDateAction: () => cyGetFacilitySummaryListChild(tableNum, '[data-cy="bankReviewDate-action"]'),
    bankReviewDateValue: () => cyGetFacilitySummaryListValue(tableNum, '[data-cy="bankReviewDate-action"]'),
    bankReviewDateKey: () => cyGetFacilitySummaryListKey(tableNum, '[data-cy="bankReviewDate-action"]'),
    monthsOfCoverAction: () => cyGetFacilitySummaryListChild(tableNum, '[data-cy="monthsOfCover-action"]'),
    monthsOfCoverValue: () => cyGetFacilitySummaryListValue(tableNum, '[data-cy="monthsOfCover-action"]'),
    monthsOfCoverKey: () => cyGetFacilitySummaryListKey(tableNum, '[data-cy="monthsOfCover-action"]'),
    facilityProvidedOnAction: () => cyGetFacilitySummaryListChild(tableNum, '[data-cy="details-action"]'),
    facilityProvidedOnValue: () => cyGetFacilitySummaryListValue(tableNum, '[data-cy="details-action"]'),
    facilityProvidedOnKey: () => cyGetFacilitySummaryListKey(tableNum, '[data-cy="details-action"]'),
    valueAction: () => cyGetFacilitySummaryListChild(tableNum, '[data-cy="value-action"]'),
    valueValue: () => cyGetFacilitySummaryListValue(tableNum, '[data-cy="value-action"]'),
    valueKey: () => cyGetFacilitySummaryListKey(tableNum, '[data-cy="value-action"]'),
    coverPercentageAction: () => cyGetFacilitySummaryListChild(tableNum, '[data-cy="coverPercentage-action"]'),
    coverPercentageValue: () => cyGetFacilitySummaryListValue(tableNum, '[data-cy="coverPercentage-action"]'),
    coverPercentageKey: () => cyGetFacilitySummaryListKey(tableNum, '[data-cy="coverPercentage-action"]'),
    banksMaximumLiabilityAction: () => cyGetFacilitySummaryListChild(tableNum, '[data-cy="banksMaximumLiability-action"]'),
    banksMaximumLiabilityValue: () => cyGetFacilitySummaryListValue(tableNum, '[data-cy="banksMaximumLiability-action"]'),
    banksMaximumLiabilityKey: () => cyGetFacilitySummaryListKey(tableNum, '[data-cy="banksMaximumLiability-action"]'),
    ukefMaximumLiabilityAction: () => cyGetFacilitySummaryListChild(tableNum, '[data-cy="ukefMaximumLiability-action"]'),
    ukefMaximumLiabilityValue: () => cyGetFacilitySummaryListValue(tableNum, '[data-cy="ukefMaximumLiability-action"]'),
    ukefMaximumLiabilityKey: () => cyGetFacilitySummaryListKey(tableNum, '[data-cy="ukefMaximumLiability-action"]'),
    interestPercentageAction: () => cyGetFacilitySummaryListChild(tableNum, '[data-cy="interestPercentage-action"]'),
    interestPercentageValue: () => cyGetFacilitySummaryListValue(tableNum, '[data-cy="interestPercentage-action"]'),
    interestPercentageKey: () => cyGetFacilitySummaryListKey(tableNum, '[data-cy="interestPercentage-action"]'),
    feeTypeAction: () => cyGetFacilitySummaryListChild(tableNum, '[data-cy="feeType-action"]'),
    feeTypeValue: () => cyGetFacilitySummaryListValue(tableNum, '[data-cy="feeType-action"]'),
    feeTypeKey: () => cyGetFacilitySummaryListKey(tableNum, '[data-cy="feeType-action"]'),
    feeFrequencyAction: () => cyGetFacilitySummaryListChild(tableNum, '[data-cy="feeFrequency-action"]'),
    feeFrequencyValue: () => cyGetFacilitySummaryListValue(tableNum, '[data-cy="feeFrequency-action"]'),
    feeFrequencyKey: () => cyGetFacilitySummaryListKey(tableNum, '[data-cy="feeFrequency-action"]'),
    dayCountBasisAction: () => cyGetFacilitySummaryListChild(tableNum, '[data-cy="dayCountBasis-action"]'),
    dayCountBasisValue: () => cyGetFacilitySummaryListValue(tableNum, '[data-cy="dayCountBasis-action"]'),
    dayCountBasisKey: () => cyGetFacilitySummaryListKey(tableNum, '[data-cy="dayCountBasis-action"]'),
  }),

  supportingInfoListRowKey: (tableNum, rowNum) =>
    cy.get('[data-cy="supportingInfo-summary-list"]').eq(tableNum).find('.govuk-summary-list__row').eq(rowNum).find('.govuk-summary-list__key'),
  supportingInfoListRowValue: (tableNum, rowNum) =>
    cy.get('[data-cy="supportingInfo-summary-list"]').eq(tableNum).find('.govuk-summary-list__row').eq(rowNum).find('.govuk-summary-list__value'),
  supportingInfoListRowAction: (tableNum, rowNum) =>
    cy.get('[data-cy="supportingInfo-summary-list"]').eq(tableNum).find('.govuk-summary-list__row').eq(rowNum).find('.govuk-summary-list__actions'),

  submitHeading: () => cy.get('[data-cy="submit-heading"]'),
  submitButton: () => cy.get('[data-cy="submit-button"]'),
  submitButtonPostApproval: () => cy.get('[data-cy="submit-ukef-approved-application-to-checker"]'),
  returnButton: () => cy.get('[data-cy="return-button"]'),
};

export default applicationPreview;
