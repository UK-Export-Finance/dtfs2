const pricingAndRiskPage = {
  addRatingLink: () => cy.get('[data-cy="add-credit-rating-link"]'),
  exporterTableCreditRatingNotAddedTag: () => cy.get('[data-cy="exporter-table-rating-not-set"]'),
  exporterTableRatingValue: () => cy.get('[data-cy="exporter-table-credit-rating-value"]'),
  exporterTableChangeCreditRatingLink: () => cy.get('[data-cy="exporter-table-change-credit-rating-link"]'),
  exporterTableLossGivenDefault: () => cy.get('[data-cy="exporter-table-loss-given-default-value"]'),
  exporterTableProbabilityOfDefault: () => cy.get('[data-cy="exporter-table-probability-of-default-value"]'),


  facilityTable: (facilityId) => {
    const table = cy.get(`[data-cy="facility-${facilityId}-pricing-risk-table"]`);
    return {
      table,
      facilityLink: () => table.get(`[data-cy="facility-${facilityId}-ukef-facility-id-link"]`),
      riskProfile: () => table.get(`[data-cy="facility-${facilityId}-risk-profile-value"]`),
    };
  },
};

module.exports = pricingAndRiskPage;
