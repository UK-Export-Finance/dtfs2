module.exports = (user) => {
  cy.login(user);
  cy.clickDashboardDealLink();
};
