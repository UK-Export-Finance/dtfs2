const facilityPage = {
  facilityValueExportCurrency: () => cy.get('[data-cy="facility-value-export-currency"]'),
  facilityValueGbp: () => cy.get('[data-cy="facility-value-gbp"]'),
  facilityMaximumUkefExposure: () => cy.get('[data-cy="facility-maximum-ukef-exposure"]'),
  facilityTenor: () => cy.get('[data-cy="facility-tenor"]'),
};

module.exports = facilityPage;
