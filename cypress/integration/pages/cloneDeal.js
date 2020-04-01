const page = {
  bankDealIdInput: () => cy.get('#bankDealId'),
  bankDealNameInput: () => cy.get('#bankDealName'),
  submit: () => cy.get('button'),
};

module.exports = page;
