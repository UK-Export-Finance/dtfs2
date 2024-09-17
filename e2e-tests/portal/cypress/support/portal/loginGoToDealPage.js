const pages = require('../../e2e/pages');

module.exports = (user) => {
  cy.login(user);
  pages.dashboardDeals.rowIndex.link(1).click();
};
