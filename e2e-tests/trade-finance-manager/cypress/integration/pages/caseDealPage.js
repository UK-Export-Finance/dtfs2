const caseDealPage = {
  caseSummary: () => cy.get('[data-cy="case-summary"]'),
  caseSubNavigation: () => cy.get('[data-cy="case-sub-navigation"]'),
  dealBankDetails: () => cy.get('[data-cy="deal-bank-details"]'),
  dealFacilities: () => cy.get('[data-cy="deal-facilities"]'),
  partiesLink: () => cy.get('[data-cy="parties-link"]'),
  bankSecuritySection: () => cy.get('[data-cy="deal-bank-security-details"]'),
  bankSecuritySectionHeading: () => cy.get('[data-cy="bank-security-section-heading"]'),
  bankSecuritySubHeading: () => cy.get('[data-cy="bank-security-sub-heading"]'),
  bankSecurityFacilitySubHeading: () => cy.get('[data-cy="bank-security-facility-sub-heading"]'),
  bankSecurityText: () => cy.get('[data-cy="bank-security-text"]'),
  bankSecurityFacilityText: () => cy.get('[data-cy="bank-security-facility-text"]'),

  dealFacilitiesTable: {
    row: (facilityId) => {
      cy.get(`[data-cy="facility-${facilityId}"]`).as('row');
      return {
        facilityId: () => cy.get('@row').get(`[data-cy="facility-${facilityId}-ukef-facility-id-link"]`),
        facilityTenor: () => cy.get('@row').get(`[data-cy="facility-${facilityId}-tenor"]`),
        facilityEndDate: () => cy.get('@row').get(`[data-cy="facility-${facilityId}-cover-end-date"]`),
        exportCurrency: () => cy.get('@row').get(`[data-cy="facility-${facilityId}-value-export-currency"]`),
        valueGBP: () => cy.get('@row').get(`[data-cy="facility-${facilityId}-value-gbp"]`),
        exposure: () => cy.get('@row').get(`[data-cy="facility-${facilityId}-ukef-exposure"]`),
        totalValue: () => cy.get('@row').get('[data-cy="facilities-total-value"]'),
        totalExposure: () => cy.get('@row').get('[data-cy="facilities-total-ukef-exposure"]'),
        facilityExposure: () => cy.get('@row').get(`[data-cy="facility-${facilityId}-ukef-exposure"]`),
      };
    },
  },
};

module.exports = caseDealPage;
