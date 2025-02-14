/**
 * loginGoToDealPage
 * Login and go to the deal page
 * @param {Object} user
 */
const loginGoToDealPage = (user) => {
  cy.login(user);
  cy.clickDashboardDealLink();
};

export default loginGoToDealPage;
