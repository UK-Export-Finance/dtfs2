const { dashboardDeals } = require('../../e2e/pages');

module.exports = (user) => {
  cy.login(user);
  dashboardDeals.rowIndex.link().click();
};
