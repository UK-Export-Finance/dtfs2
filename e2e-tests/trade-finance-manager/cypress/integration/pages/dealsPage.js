const dealsPage = {
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
