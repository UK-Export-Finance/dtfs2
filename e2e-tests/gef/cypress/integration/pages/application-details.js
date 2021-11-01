const applicationDetails = {
  applicationDetailsPage: () => cy.get('[data-cy="application-details-page"]'),

  // application banner/summary
  applicationBanner: () => cy.get('[data-cy="application-banner"]'),
  bannerStatus: () => cy.get('[data-cy="status"]'),
  bannerProduct: () => cy.get('[data-cy="product"]'),
  bannerDateCreated: () => cy.get('[data-cy="date-created"]'),
  bannerSubmissionType: () => cy.get('[data-cy="submission-type"]'),
  bannerCreatedBy: () => cy.get('[data-cy="created-by"]'),
  bannerExporter: () => cy.get('[data-cy="exporter"]'),
  bannerCheckedBy: () => cy.get('[data-cy="checked-by"]'),
  bannerBuyer: () => cy.get('[data-cy="buyer"]'),
  bannerDateSubmitted: () => cy.get('[data-cy="date-submitted"]'),
  bannerUkefDealId: () => cy.get('[data-cy="ukef-deal-id"]'),

  bankRefName: () => cy.get('[data-cy="bank-reference"]'),
  editRefNameLink: () => cy.get('[data-cy="edit-refname-link"]'),
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
  automaticCoverCriteria: () => cy.get('[data-cy="automatic-cover-criteria"]'),
  eligibilityCriterionTwelve: () => cy.get('[data-cy="criterion-12-text'),
  eligibilityCriterionThirteen: () => cy.get('[data-cy="criterion-13-text'),
  eligibilityCriterionFourteen: () => cy.get('[data-cy="criterion-14-text'),
  eligibilityCriterionFifteen: () => cy.get('[data-cy="criterion-15-text'),
  eligibilityCriterionSixteen: () => cy.get('[data-cy="criterion-16-text'),
  eligibilityCriterionSeventeen: () => cy.get('[data-cy="criterion-17-text'),
  eligibilityCriterionEighteen: () => cy.get('[data-cy="criterion-18-text'),
  eligibilityCriterionNineteen: () => cy.get('[data-cy="criterion-19-text'),

  facilityHeading: () => cy.get('[data-cy="facility-heading"]'),
  facilityStatus: () => cy.get('[data-cy="facility-status"]'),
  addCashFacilityButton: () => cy.get('[data-cy="add-cash-facility-button"]'),
  addContingentFacilityButton: () => cy.get('[data-cy="add-contingent-facility-button"]'),
  facilitySummaryList: () => cy.get('[data-cy="facility-summary-list"]'),
  deleteFacilityLink: () => cy.get('[data-cy="delete-facility"]'),

  supportingInfoHeading: () => cy.get('[data-cy="supportingInfo-heading"]'),
  supportingInfoStatus: () => cy.get('[data-cy="supportingInfo-status"]'),
  supportingInfoStartLink: () => cy.get('[data-cy="supportingInfo-start-link'),
  supportingInfoSummaryList: () => cy.get('[data-cy="supportingInfo-summary-list"]'),

  submitHeading: () => cy.get('[data-cy="submit-heading"]'),
  submitButton: () => cy.get('[data-cy="submit-button"]'),
  submitValidationText: () => cy.get('[data-cy="submit-validation-text"]'),
};

export default applicationDetails;
