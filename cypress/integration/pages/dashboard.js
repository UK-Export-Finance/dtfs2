const page = {
  visit: () => cy.visit('/dashboard'),
  first: () => cy.get('[data-cy="First"]'),
  previous: () => cy.get('[data-cy="Previous"]'),
  next: () => cy.get('[data-cy="Next"]'),
  last: () => cy.get('[data-cy="Last"]'),
  totalItems: () => cy.get('[data-cy="totalItems"]'),
  row: (deal) => {
    return {
      bank: () => cy.get('[data-cy="bank"]'),
      bankSupplyContractID: () => cy.get('[data-cy="bankSupplyContractID"]'),
      ukefDealId: () => cy.get('[data-cy="ukefDealId"]'),
      status: () => cy.get('[data-cy="status"]'),
      submissionType: () => cy.get('[data-cy="submissionType"]'),
      maker: () => cy.get('[data-cy="maker"]'),
      checker: () => cy.get('[data-cy="checker"]'),
      updated: () => cy.get('[data-cy="updated"]'),
    }
  },
  confirmDealsPresent: (deals) => {
    for (const deal of deals) {
      cy.get(`#deal_${deal._id}`)
    }
  }
}

module.exports = page;
