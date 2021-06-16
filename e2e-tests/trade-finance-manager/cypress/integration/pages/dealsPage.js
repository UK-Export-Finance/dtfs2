const dealsPage = {
  heading: () => cy.get('[data-cy="deals-heading"]'),
  searchFormInput: () => cy.get('[data-cy="search-input"]'),
  searchFormSubmitButton: () => cy.get('[data-cy="submit-button"]'),
  dealsTableRows: () => cy.get('[data-cy="deals-table"] tbody tr'),
  dealsTable: {
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
