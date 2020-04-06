const page = {
  visit: (deal) => cy.visit(`/contract/${deal._id}/edit-name`),
  bankSupplyContractName: () => cy.get('[data-cy="bankSupplyContractName"]'),
  submit: () => cy.get('[data-cy="Submit"]'),
}

module.exports = page;
