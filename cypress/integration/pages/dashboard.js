const page = {
  visit: () => cy.visit('/dashboard'),
  first: () => cy.get('[data-cy="First"]'),
  previous: () => cy.get('[data-cy="Previous"]'),
  next: () => cy.get('[data-cy="Next"]'),
  last: () => cy.get('[data-cy="Last"]'),
  totalItems: () => cy.get('[data-cy="totalItems"]'),
  row: (deal) => {
    const row = cy.get(`[data-cy="deal_${deal._id}"]`);
    return {
      bank: () => row.get('[data-cy="bank"]'),
      bankSupplyContractID: () => row.get('[data-cy="bankSupplyContractID"]'),
      bankDealIdLink: () => cy.get(`#deal_${deal._id}`).get('._bankDealId a'),
      ukefDealId: () => row.get('[data-cy="ukefDealId"]'),
      status: () => row.get('[data-cy="status"]'),
      submissionType: () => row.get('[data-cy="submissionType"]'),
      maker: () => row.get('[data-cy="maker"]'),
      checker: () => row.get('[data-cy="checker"]'),
      updated: () => row.get('[data-cy="updated"]'),
    },
  },
  lastTableRow: () => cy.get('table tbody tr').last(),
  lastTableRowBankDealIdLink: (row) => {
    return row.find('._bankDealId a');
  },
  confirmDealsPresent: (deals) => {
    for (const deal of deals) {
      cy.get(`[data-cy="deal_${deal._id}"]`)
    }
  }
};

module.exports = page;
