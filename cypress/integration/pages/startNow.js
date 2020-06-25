const header = require('./header');

const page = {
  visit: () => cy.visit('/start-now'),
  header: () => header,
  dashboardLink1: () => cy.get('[data-cy="dashboardLink1"]'),
  dashboardLink2: () => cy.get('[data-cy="dashboardLink2"]'),
  createNewSubmission: () => cy.get('[data-cy="CreateNewSubmission"]'),
  viewDashboard: () => cy.get('[data-cy="ViewDashboard"]'),
}

module.exports = page;
