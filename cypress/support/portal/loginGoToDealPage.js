const pages = require('../../integration/pages');

module.exports = (user, deal) => {
  cy.login(user);
  pages.contract.visit(deal);
};
