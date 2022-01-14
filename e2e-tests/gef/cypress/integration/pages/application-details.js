/* eslint-disable no-undef */
const applicationDetails = {
  applicationDetailsPage: () => cy.get('[data-cy="application-details-page"]'),

  bankRefName: () => cy.get('[data-cy="bank-reference"]'),
  editRefNameLink: () => cy.get('[data-cy="edit-refname-link"]'),
  abandonLink: () => cy.get('[data-cy="abandon-link"]'),
  captionHeading: () => cy.get('[data-cy="heading-caption"]'),
  mainHeading: () => cy.get('[data-cy="main-heading"]'),
  exporterHeading: () => cy.get('[data-cy="exporter-heading"]'),
  exporterStatus: () => cy.get('[data-cy="exporter-status"]'),
  exporterDetailsLink: () => cy.get('[data-cy="exporter-details-link"]'),
  exporterSummaryList: () => cy.get('[data-cy="exporter-summary-list"]'),

  exporterSummaryListRowKey: (tableNum, rowNum) => cy.get('[data-cy="exporter-summary-list"]').eq(tableNum).find('.govuk-summary-list__row').eq(rowNum)
    .find('.govuk-summary-list__key'),
  exporterSummaryListRowValue: (tableNum, rowNum) => cy.get('[data-cy="exporter-summary-list"]').eq(tableNum).find('.govuk-summary-list__row').eq(rowNum)
    .find('.govuk-summary-list__value'),
  exporterSummaryListRowAction: (tableNum, rowNum) => cy.get('[data-cy="exporter-summary-list"]').eq(tableNum).find('.govuk-summary-list__row').eq(rowNum)
    .find('.govuk-summary-list__actions'),

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

  automaticCoverSummaryListRowKey: (tableNum, rowNum) => cy.get('[data-cy="automatic-cover-summary-list"]').eq(tableNum).find('.govuk-summary-list__row').eq(rowNum)
    .find('.govuk-summary-list__key'),
  automaticCoverSummaryListRowValue: (tableNum, rowNum) => cy.get('[data-cy="automatic-cover-summary-list"]').eq(tableNum).find('.govuk-summary-list__row').eq(rowNum)
    .find('.govuk-summary-list__value'),
  automaticCoverSummaryListRowAction: (tableNum, rowNum) => cy.get('[data-cy="automatic-cover-summary-list"]').eq(tableNum).find('.govuk-summary-list__row').eq(rowNum)
    .find('.govuk-summary-list__actions'),

  facilityHeading: () => cy.get('[data-cy="facility-heading"]'),
  facilityStatus: () => cy.get('[data-cy="facility-status"]'),
  addCashFacilityButton: () => cy.get('[data-cy="add-cash-facility-button"]'),
  addContingentFacilityButton: () => cy.get('[data-cy="add-contingent-facility-button"]'),
  facilitySummaryList: () => cy.get('[data-cy="facility-summary-list"]'),
  deleteFacilityLink: () => cy.get('[data-cy="delete-facility"]'),

  facilitySummaryListRowKey: (tableNum, rowNum) => cy.get('[data-cy="facility-summary-list"]').eq(tableNum).find('.govuk-summary-list__row').eq(rowNum)
    .find('.govuk-summary-list__key'),
  facilitySummaryListRowValue: (tableNum, rowNum) => cy.get('[data-cy="facility-summary-list"]').eq(tableNum).find('.govuk-summary-list__row').eq(rowNum)
    .find('.govuk-summary-list__value'),
  facilitySummaryListRowAction: (tableNum, rowNum) => cy.get('[data-cy="facility-summary-list"]').eq(tableNum).find('.govuk-summary-list__row').eq(rowNum)
    .find('.govuk-summary-list__actions'),

  supportingInfoHeading: () => cy.get('[data-cy="supportingInfo-heading"]'),
  supportingInfoStatus: () => cy.get('[data-cy="supportingInfo-status"]'),
  supportingInfoStartLink: () => cy.get('[data-cy="supportingInfo-start-link'),
  supportingInfoSummaryList: () => cy.get('[data-cy="supportingInfo-summary-list"]'),

  supportingInfoListRowKey: (tableNum, rowNum) => cy.get('[data-cy="supportingInfo-summary-list"]').eq(tableNum).find('.govuk-summary-list__row').eq(rowNum)
    .find('.govuk-summary-list__key'),
  supportingInfoListRowValue: (tableNum, rowNum) => cy.get('[data-cy="supportingInfo-summary-list"]').eq(tableNum).find('.govuk-summary-list__row').eq(rowNum)
    .find('.govuk-summary-list__value'),
  supportingInfoListRowAction: (tableNum, rowNum) => cy.get('[data-cy="supportingInfo-summary-list"]').eq(tableNum).find('.govuk-summary-list__row').eq(rowNum)
    .find('.govuk-summary-list__actions'),

  submitHeading: () => cy.get('[data-cy="submit-heading"]'),
  submitButton: () => cy.get('[data-cy="submit-button"]'),
  submitValidationText: () => cy.get('[data-cy="submit-validation-text"]'),
  supportingInfoList: () => cy.get('[data-cy="supportingInfo-summary-list"]'),
};

export default applicationDetails;
