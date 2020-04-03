const page = {
  visit: (deal) => cy.visit(`/contract/${deal._id}/edit-name`),
  supplyContractName: () => cy.get('[data-cy="supplyContractName"]'),
  submit: () => cy.get('[data-cy="Submit"]'),
}

module.exports = page;
