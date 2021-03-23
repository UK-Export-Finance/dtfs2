const facilityPage = {
  facilityValueExportCurrency: () => cy.get('[data-cy="facility-value-export-currency"]'),
  facilityValueGbp: () => cy.get('[data-cy="facility-value-gbp"]'),
  facilityMaximumUkefExposure: () => cy.get('[data-cy="facility-maximum-ukef-exposure"]'),
  facilityTenor: () => cy.get('[data-cy="facility-tenor"]'),

  facilityStage: () => cy.get('[data-cy="facility-stage"]'),
  facilityBankIssueNoticeReceived: () => cy.get('[data-cy="facility-bank-issue-notice-received"]'),

  facilityCoverStartDate: () => cy.get('[data-cy="facility-cover-start-date"]'),
  facilityCoverEndDate: () => cy.get('[data-cy="facility-cover-end-date"]'),

};

module.exports = facilityPage;
