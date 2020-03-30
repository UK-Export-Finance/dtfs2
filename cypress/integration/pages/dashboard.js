const page = {
  visit: () => cy.visit('/dashboard'),
  deal: (bankDealId) => cy.contains(bankDealId),
}

module.exports = page;
