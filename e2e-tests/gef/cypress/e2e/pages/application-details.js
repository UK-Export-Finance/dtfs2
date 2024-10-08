const cyGetFacilitySummaryListChild = (tableNum, selector) => cy.get('[data-cy="facility-summary-list"]').eq(tableNum).find(selector);
const cyGetFacilitySummaryListValue = (tableNum, actionSelector) =>
  cyGetFacilitySummaryListChild(tableNum, actionSelector).parent().parent().find('.govuk-summary-list__value');

const applicationDetails = {
  applicationDetailsPage: () => cy.get('[data-cy="application-details-page"]'),

  bankRefName: () => cy.get('[data-cy="bank-reference"]'),
  editRefNameLink: () => cy.get('[data-cy="edit-refname-link"]'),
  abandonLink: () => cy.get('[data-cy="abandon-link"]'),
  exporterHeading: () => cy.get('[data-cy="exporter-heading"]'),
  exporterStatus: () => cy.get('[data-cy="exporter-status"]'),
  exporterDetailsLink: () => cy.get('[data-cy="exporter-details-link"]'),
  exporterSummaryList: () => cy.get('[data-cy="exporter-summary-list"]'),

  exporterSummaryListRowKey: (tableNum, rowNum) =>
    cy.get('[data-cy="exporter-summary-list"]').eq(tableNum).find('.govuk-summary-list__row').eq(rowNum).find('.govuk-summary-list__key'),
  exporterSummaryListRowValue: (tableNum, rowNum) =>
    cy.get('[data-cy="exporter-summary-list"]').eq(tableNum).find('.govuk-summary-list__row').eq(rowNum).find('.govuk-summary-list__value'),
  exporterSummaryListRowAction: (tableNum, rowNum) =>
    cy.get('[data-cy="exporter-summary-list"]').eq(tableNum).find('.govuk-summary-list__row').eq(rowNum).find('.govuk-summary-list__actions'),

  automaticCoverHeading: () => cy.get('[data-cy="automatic-cover-heading"]'),
  automaticCoverStatus: () => cy.get('[data-cy="automatic-cover-status"]'),
  automaticCoverDetailsLink: () => cy.get('[data-cy="automatic-cover-details-link"]'),
  automaticCoverSummaryList: () => cy.get('[data-cy="automatic-cover-summary-list"]'),
  automaticCoverCriteria: () => cy.get('[data-cy="automatic-cover-criteria"]'),
  eligibilityCriterionTwelve: () => cy.get('[data-cy="criterion-12-text'),
  eligibilityCriterionThirteen: () => cy.get('[data-cy="criterion-13-text'),
  eligibilityCriterionFourteen: () => cy.get('[data-cy="criterion-14-text'),
  eligibilityCriterionFifteen: () => cy.get('[data-cy="criterion-15-text'),
  eligibilityCriterionSixteen: () => cy.get('[data-cy="criterion-16-text'),
  eligibilityCriterionSeventeen: () => cy.get('[data-cy="criterion-17-text'),
  eligibilityCriterionEighteen: () => cy.get('[data-cy="criterion-18-text'),
  eligibilityCriterionNineteen: () => cy.get('[data-cy="criterion-19-text'),

  automaticCoverSummaryListRowAction: (tableNum, rowNum) =>
    cy.get('[data-cy="automatic-cover-summary-list"]').eq(tableNum).find('.govuk-summary-list__row').eq(rowNum).find('.govuk-summary-list__actions'),

  facilityHeading: () => cy.get('[data-cy="facility-heading"]'),
  facilityStatus: () => cy.get('[data-cy="facility-status"]'),
  addCashFacilityButton: () => cy.get('[data-cy="add-cash-facility-button"]'),
  addContingentFacilityButton: () => cy.get('[data-cy="add-contingent-facility-button"]'),
  facilityGuidance: () => cy.get('[data-cy="facility-guidance"]'),
  facilitySummaryList: () => cy.get('[data-cy="facility-summary-list"]'),
  deleteFacilityLink: () => cy.get('[data-cy="delete-facility"]'),

  facilitySummaryListTable: (tableNum) => ({
    nameAction: () => cyGetFacilitySummaryListChild(tableNum, '[data-cy="name-action"]'),
    nameValue: () => cyGetFacilitySummaryListValue(tableNum, '[data-cy="name-action"]'),
    ukefFacilityIdAction: () => cyGetFacilitySummaryListChild(tableNum, '[data-cy="ukefFacilityId-action"]'),
    ukefFacilityIdValue: () => cyGetFacilitySummaryListValue(tableNum, '[data-cy="ukefFacilityId-action"]'),
    hasBeenIssuedAction: () => cyGetFacilitySummaryListChild(tableNum, '[data-cy="hasBeenIssued-action"]'),
    hasBeenIssuedValue: () => cyGetFacilitySummaryListValue(tableNum, '[data-cy="hasBeenIssued-action"]'),
    issueDateAction: () => cyGetFacilitySummaryListChild(tableNum, '[data-cy="issueDate-action"]'),
    issueDateValue: () => cyGetFacilitySummaryListValue(tableNum, '[data-cy="issueDate-action"]'),
    coverStartDateAction: () => cyGetFacilitySummaryListChild(tableNum, '[data-cy="coverStartDate-action"]'),
    coverStartDateValue: () => cyGetFacilitySummaryListValue(tableNum, '[data-cy="coverStartDate-action"]'),
    coverEndDateAction: () => cyGetFacilitySummaryListChild(tableNum, '[data-cy="coverEndDate-action"]'),
    coverEndDateValue: () => cyGetFacilitySummaryListValue(tableNum, '[data-cy="coverEndDate-action"]'),
    isUsingFacilityEndDateAction: () => cyGetFacilitySummaryListChild(tableNum, '[data-cy="isUsingFacilityEndDate-action"]'),
    isUsingFacilityEndDateValue: () => cyGetFacilitySummaryListValue(tableNum, '[data-cy="isUsingFacilityEndDate-action"]'),
    facilityEndDateAction: () => cyGetFacilitySummaryListChild(tableNum, '[data-cy="facilityEndDate-action"]'),
    facilityEndDateValue: () => cyGetFacilitySummaryListValue(tableNum, '[data-cy="facilityEndDate-action"]'),
    bankReviewDateAction: () => cyGetFacilitySummaryListChild(tableNum, '[data-cy="bankReviewDate-action"]'),
    bankReviewDateValue: () => cyGetFacilitySummaryListValue(tableNum, '[data-cy="bankReviewDate-action"]'),
    monthsOfCoverAction: () => cyGetFacilitySummaryListChild(tableNum, '[data-cy="monthsOfCover-action"]'),
    monthsOfCoverValue: () => cyGetFacilitySummaryListValue(tableNum, '[data-cy="monthsOfCover-action"]'),
    facilityProvidedOnAction: () => cyGetFacilitySummaryListChild(tableNum, '[data-cy="details-action"]'),
    facilityProvidedOnValue: () => cyGetFacilitySummaryListValue(tableNum, '[data-cy="details-action"]'),
    valueAction: () => cyGetFacilitySummaryListChild(tableNum, '[data-cy="value-action"]'),
    valueValue: () => cyGetFacilitySummaryListValue(tableNum, '[data-cy="value-action"]'),
    coverPercentageAction: () => cyGetFacilitySummaryListChild(tableNum, '[data-cy="coverPercentage-action"]'),
    coverPercentageValue: () => cyGetFacilitySummaryListValue(tableNum, '[data-cy="coverPercentage-action"]'),
    banksMaximumLiabilityAction: () => cyGetFacilitySummaryListChild(tableNum, '[data-cy="banksMaximumLiability-action"]'),
    banksMaximumLiabilityValue: () => cyGetFacilitySummaryListValue(tableNum, '[data-cy="banksMaximumLiability-action"]'),
    ukefMaximumLiabilityAction: () => cyGetFacilitySummaryListChild(tableNum, '[data-cy="ukefMaximumLiability-action"]'),
    ukefMaximumLiabilityValue: () => cyGetFacilitySummaryListValue(tableNum, '[data-cy="ukefMaximumLiability-action"]'),
    interestPercentageAction: () => cyGetFacilitySummaryListChild(tableNum, '[data-cy="interestPercentage-action"]'),
    interestPercentageValue: () => cyGetFacilitySummaryListValue(tableNum, '[data-cy="interestPercentage-action"]'),
    feeTypeAction: () => cyGetFacilitySummaryListChild(tableNum, '[data-cy="feeType-action"]'),
    feeTypeValue: () => cyGetFacilitySummaryListValue(tableNum, '[data-cy="feeType-action"]'),
    feeFrequencyAction: () => cyGetFacilitySummaryListChild(tableNum, '[data-cy="feeFrequency-action"]'),
    feeFrequencyValue: () => cyGetFacilitySummaryListValue(tableNum, '[data-cy="feeFrequency-action"]'),
    dayCountBasisAction: () => cyGetFacilitySummaryListChild(tableNum, '[data-cy="dayCountBasis-action"]'),
    dayCountBasisValue: () => cyGetFacilitySummaryListValue(tableNum, '[data-cy="dayCountBasis-action"]'),
  }),

  supportingInfoHeading: () => cy.get('[data-cy="supportingInfo-heading"]'),
  supportingInfoStatus: () => cy.get('[data-cy="supportingInfo-status"]'),
  supportingInfoStartLink: () => cy.get('[data-cy="supportingInfo-start-link'),
  supportingInfoSummaryList: () => cy.get('[data-cy="supportingInfo-summary-list"]'),

  supportingInfoListRowAction: (tableNum, rowNum) =>
    cy.get('[data-cy="supportingInfo-summary-list"]').eq(tableNum).find('.govuk-summary-list__row').eq(rowNum).find('.govuk-summary-list__actions'),

  submitHeading: () => cy.get('[data-cy="submit-heading"]'),
  submitValidationText: () => cy.get('[data-cy="submit-validation-text"]'),
  supportingInfoList: () => cy.get('[data-cy="supportingInfo-summary-list"]'),

  comments: () => cy.get('[data-cy="latest-comment"]'),
};

export default applicationDetails;
