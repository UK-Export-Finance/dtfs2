const caseDealPage = {
  dealBankDetails: () => cy.get('[data-cy="deal-bank-details"]'),
  dealFacilities: () => cy.get('[data-cy="deal-facilities"]'),
  partiesLink: () => cy.get('[data-cy="parties-link"]'),
  bankSecuritySection: () => cy.get('[data-cy="deal-bank-security-details"]'),
  bankSecuritySectionHeading: () => cy.get('[data-cy="bank-security-section-heading"]'),
  bankSecuritySubHeading: () => cy.get('[data-cy="bank-security-sub-heading"]'),
  bankSecurityFacilitySubHeading: () => cy.get('[data-cy="bank-security-facility-sub-heading"]'),
  bankSecurityText: () => cy.get('[data-cy="bank-security-text"]'),
  bankSecurityFacilityText: () => cy.get('[data-cy="bank-security-facility-text"]'),
  cancelDealButton: () => cy.get('[data-cy="cancel-deal-button"]'),
  dealStage: () => cy.get('[data-cy="ukef-deal-stage-value"]'),

  dealFacilitiesTable: {
    row: (facilityId) => {
      cy.get(`[data-cy="facility-${facilityId}"]`).as(`facility${facilityId}`);
      return {
        facilityId: () => cy.get(`@facility${facilityId}`).get(`[data-cy="facility-${facilityId}-ukef-facility-id-link"]`),
        facilityTenor: () => cy.get(`@facility${facilityId}`).get(`[data-cy="facility-${facilityId}-tenor"]`),
        facilityCoverEndDate: () => cy.get(`@facility${facilityId}`).get(`[data-cy="facility-${facilityId}-cover-end-date"]`),
        exportCurrency: () => cy.get(`@facility${facilityId}`).get(`[data-cy="facility-${facilityId}-value-export-currency"]`),
        valueGBP: () => cy.get(`@facility${facilityId}`).get(`[data-cy="facility-${facilityId}-value-gbp"]`),
        exposure: () => cy.get(`@facility${facilityId}`).get(`[data-cy="facility-${facilityId}-ukef-exposure"]`),
        totalValue: () => cy.get(`@facility${facilityId}`).get('[data-cy="facilities-total-value"]'),
        totalExposure: () => cy.get(`@facility${facilityId}`).get('[data-cy="facilities-total-ukef-exposure"]'),
        facilityValueGBP: () => cy.get(`@facility${facilityId}`).get(`[data-cy="facility-${facilityId}-value-gbp"]`),
        facilityExposure: () => cy.get(`@facility${facilityId}`).get(`[data-cy="facility-${facilityId}-ukef-exposure"]`),
        facilityStage: () => cy.get(`@facility${facilityId}`).get(`[data-cy="facility-${facilityId}-stage`),
      };
    },
  },

  eligibilityCriteriaTable: {
    row: (index) => {
      cy.get(`[data-cy="criterion-${index}-row"]`).as(`eligibilityCriteriaRow${index}`);
      return {
        answerTag: () => cy.get(`@eligibilityCriteriaRow${index}`).get('[data-cy="eligibility-criteria-answer-tag"'),
        heading: (criterionId) => cy.get(`@eligibilityCriteriaRow${index}`).get(`[data-cy="criterion-${criterionId}-heading"]`),
      };
    },
  },
};

module.exports = caseDealPage;
