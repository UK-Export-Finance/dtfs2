const login = require('./logIn');
const pages = require('../pages');

module.exports = (user, deal) => {
  // login and go to dashboard
  login(user);
  pages.dashboard.visit();

  // get the row that corresponds to our deal
  const row = pages.dashboard.row(deal);

  // go to deal page
  row.bankSupplyContractIDLink().click();
  cy.url().should('include', '/contract/');
};

