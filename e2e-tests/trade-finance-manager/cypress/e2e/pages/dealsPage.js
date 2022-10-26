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
      bank: () => cy.get('[data-cy="deals-table-heading-bank"]'),
      bankSortButton: () => cy.get('[data-cy="deals-table-heading-bank-button"]'),
      buyer: () => cy.get('[data-cy="deals-table-heading-buyer"]'),
      buyerSortButton: () => cy.get('[data-cy="deals-table-heading-buyer-button"]'),
    },
    row: (dealId) => {
      cy.get(`[data-cy="deal-${dealId}"]`).as('row');
      return {
        dealLink: () => cy.get('@row').get(`[data-cy="deal-${dealId}-ukef-deal-id-link"]`),
        dealLinkText: () => cy.get('@row').get(`[data-cy="deal-${dealId}-ukef-deal-id-link-text"]`),
        product: () => cy.get('@row').get(`[data-cy="deal-${dealId}-product"]`),
        submissionType: () => cy.get('@row').get(`[data-cy="deal-${dealId}-type"]`),
        exporterName: () => cy.get('@row').get(`[data-cy="deal-${dealId}-exporterName"]`),
        buyerName: () => cy.get('@row').get(`[data-cy="deal-${dealId}-buyerName"]`),
        bank: () => cy.get('@row').get(`[data-cy="deal-${dealId}-bank"]`),
        stage: () => cy.get('@row').get(`[data-cy="deal-${dealId}-stage"]`),
        dateReceived: () => cy.get('@row').get(`[data-cy="deal-${dealId}-date-received"]`),
      };
    },
  },

};

module.exports = dealsPage;
