const facilityPage = {
  allFacilitiesLink: () => cy.get('[data-cy="all-facilities-nav-link"]'),
  facilityTabDetails: () => cy.get('[data-cy="facility-details-tab-details"]'),
  facilityTabPremiumSchedule: () => cy.get('[data-cy="facility-details-tab-premium-schedule"]'),
  facilityTabAmendments: () => cy.get('[data-cy="facility-details-tab-amendments"]'),

  firstDrawdownAmountInExportCurrency: () => cy.get('[data-cy="first-drawdown-amount-in-export-currency"]'),
  facilityStage: () => cy.get('[data-cy="facility-stage"]'),

  facilityValueExportCurrency: () => cy.get('[data-cy="facility-value-export-currency"]'),
  facilityExchangeRate: () => cy.get('[data-cy="facility-exchange-rate"]'),
  facilityValueGbp: () => cy.get('[data-cy="facility-value-gbp"]'),

  facilityMaximumUkefExposure: () => cy.get('[data-cy="facility-maximum-ukef-exposure"]'),

  facilityBankIssueNoticeReceived: () => cy.get('[data-cy="facility-bank-issue-notice-received"]'),
  facilityCoverStartDate: () => cy.get('[data-cy="facility-cover-start-date"]'),
  facilityCoverEndDate: () => cy.get('[data-cy="facility-cover-end-date"]'),
  facilityTenor: () => cy.get('[data-cy="facility-tenor"]'),

  facilityDealCreditRating: () => cy.get('[data-cy="credit-rating-value"]'),
  facilityDealCreditRatingNotSet: () => cy.get('[data-cy="credit-rating-not-set-tag"]'),

  facilityFeeType: () => cy.get('[data-cy="facility-premium-type"]'),

  premiumScheduleTable: {
    total: () => cy.get('[data-cy="premium-total"]'),
  },
};

module.exports = facilityPage;
