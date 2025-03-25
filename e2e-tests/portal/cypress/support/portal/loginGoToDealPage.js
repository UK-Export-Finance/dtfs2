const pages = require('../../e2e/pages');

module.exports = (user, dealId) => {
  cy.login(user);
  pages.contract.visit(dealId);
};
