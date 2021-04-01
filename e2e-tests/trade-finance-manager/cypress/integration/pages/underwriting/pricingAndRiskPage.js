const pricingAndRiskPage = {
  creditRatingNotAddedTag: () => cy.get('[data-cy="credit-rating-table-rating-not-set"]'),
  addRatingLink: () => cy.get('[data-cy="add-credit-rating-link"]'),
  creditRatingTableRatingValue: () => cy.get('[data-cy="credit-rating-table-rating-value"]'),
  creditRatingTableChangeLink: () => cy.get('[data-cy="credit-rating-table-change-link"]'),
  creditRatingTableLossGivenDefault: () => cy.get('[data-cy="credit-rating-table-loss-given-default-value"]'),

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
