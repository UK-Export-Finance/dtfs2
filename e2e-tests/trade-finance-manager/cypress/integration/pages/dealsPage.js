const dealsPage = {
  heading: () => cy.get('[data-cy="deals-heading"]'),
  searchFormInput: () => cy.get('[data-cy="search-input"]'),
  searchFormSubmitButton: () => cy.get('[data-cy="submit-button"]'),
  dealsTableRows: () => cy.get('[data-cy="deals-table"] tbody tr'),
  dealsTable: {
    headings: {
      ukefDealId: () => cy.get('[data-cy="deals-table-heading-ukefDealId"]'),
      ukefDealIdSortButton: () => cy.get('[data-cy="deals-table-heading-ukefDealId-button"]'),
      product: () => cy.get('[data-cy="deals-table-heading-product"]'),
      productSortButton: () => cy.get('[data-cy="deals-table-heading-product-button"]'),
      stage: () => cy.get('[data-cy="deals-table-heading-stage"]'),
      stageSortButton: () => cy.get('[data-cy="deals-table-heading-stage-button"]'),
      exporter: () => cy.get('[data-cy="deals-table-heading-exporter"]'),
      exporterSortButton: () => cy.get('[data-cy="deals-table-heading-exporter-button"]'),
    },
    row: (dealId) => {
      const row = cy.get(`[data-cy="deal-${dealId}"]`);
      return {
        row,
        dealLink: () => row.get(`[data-cy="deal-${dealId}-ukef-deal-id-link"]`),
      };
    },
  },

};

module.exports = dealsPage;
