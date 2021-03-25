const facilityPage = {
  firstDrawdownAmountInExportCurrency: () => cy.get('[data-cy="first-drawdown-amount-in-export-currency"]'),
  facilityStage: () => cy.get('[data-cy="facility-stage"]'),

  facilityValueExportCurrency: () => cy.get('[data-cy="facility-value-export-currency"]'),
  facilityValueGbp: () => cy.get('[data-cy="facility-value-gbp"]'),

  facilityMaximumUkefExposure: () => cy.get('[data-cy="facility-maximum-ukef-exposure"]'),

  facilityBankIssueNoticeReceived: () => cy.get('[data-cy="facility-bank-issue-notice-received"]'),
  facilityCoverStartDate: () => cy.get('[data-cy="facility-cover-start-date"]'),
  facilityCoverEndDate: () => cy.get('[data-cy="facility-cover-end-date"]'),
  facilityTenor: () => cy.get('[data-cy="facility-tenor"]'),

  facilityDealCreditRating: () => cy.get('[data-cy="credit-rating-value"]'),
  facilityDealCreditRatingNotSet: () => cy.get('[data-cy="credit-rating-not-set-tag"]'),
};

module.exports = facilityPage;
