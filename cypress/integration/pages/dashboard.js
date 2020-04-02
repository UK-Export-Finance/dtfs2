const page = {
  visit: () => cy.visit('/dashboard'),
  next: () => cy.contains('Next'),
  previous: () => cy.contains('Previous'),
  first: () => cy.contains('First'),
  last: () => cy.contains('Last'),
  totalItems: () => cy.get('#totalItems'),
  row: (deal) => {
    return {
      bank: () => cy.get(`#deal_${deal._id}`).get('._bank'),
      bankDealId: () => cy.get(`#deal_${deal._id}`).get('._bankDealId'),
      bankDealIdLink: () => cy.get(`#deal_${deal._id}`).get('._bankDealId a'),
      ukefDealId: () => cy.get(`#deal_${deal._id}`).get('._ukefDealId'),
      status: () => cy.get(`#deal_${deal._id}`).get('._status'),
      submissionType: () => cy.get(`#deal_${deal._id}`).get('._submissionType'),
      maker: () => cy.get(`#deal_${deal._id}`).get('._maker'),
      checker: () => cy.get(`#deal_${deal._id}`).get('._checker'),
      updated: () => cy.get(`#deal_${deal._id}`).get('._updated'),
    }
  },
  lastTableRow: () => cy.get('table tbody tr').last(),
  lastTableRowBankDealIdLink: (row) => {
    return row.find('._bankDealId a');
  },
  confirmDealsPresent: (bankIds) => {
    for (const bankId of bankIds) {
      cy.contains(bankId).should('be.visible');
    }
  }
};

module.exports = page;
