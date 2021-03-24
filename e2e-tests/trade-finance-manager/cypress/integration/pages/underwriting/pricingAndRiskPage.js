const pricingAndRiskPage = {
  addRatingLink: () => cy.get('[data-cy="add-credit-rating-link"]'),
  creditRatingTableRatingValue: () => cy.get('[data-cy="credit-rating-table-rating-value"]'),
  creditRatingTableChangeLink: () => cy.get('[data-cy="credit-rating-table-change-link"]'),
};

module.exports = pricingAndRiskPage;
