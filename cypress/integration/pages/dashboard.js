const page = {
  visit: () => cy.visit('/dashboard'),
  next: () => cy.contains('Next'),
  deal: (bankDealId) => cy.contains(bankDealId),
  confirmDealsPresent: (bankIds) => {
    for (const bankId of bankIds) {
      cy.contains(bankId).should('be.visible');
    }
  }
}

module.exports = page;
