const pages = require('../../e2e/pages');

module.exports = (user, deal) => {
  cy.login(user);
  pages.contract.visit(deal);
};
