/*
const { dashboardFacilities } = require('../../../pages');
const mockUsers = require('../../../../fixtures/mockUsers');

const MAKER_LOGIN = mockUsers.find((user) => (user.roles.includes('maker')));

const transactionTestData = require('../../../../fixtures/transaction-dashboard-data');

context('The Transactions dashboard', () => {
  before(() => {
    cy.deleteDeals(MAKER_LOGIN);
    cy.insertManyDeals(transactionTestData.all, MAKER_LOGIN);
  });

  it('has pagination', () => {
    cy.login(MAKER_LOGIN);
    dashboardFacilities.visit();

    dashboardFacilities.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal('(44 items)');
    });

    dashboardFacilities.results().find('tr').should('have.length', 20);

    dashboardFacilities.next().click();
    dashboardFacilities.results().find('tr').should('have.length', 20);

    dashboardFacilities.next().click();
    dashboardFacilities.results().find('tr').should('have.length', 4);

    dashboardFacilities.previous().click();
    dashboardFacilities.results().find('tr').should('have.length', 20);

    dashboardFacilities.last().click();
    dashboardFacilities.results().find('tr').should('have.length', 4);

    dashboardFacilities.first().click();
    dashboardFacilities.results().find('tr').should('have.length', 20);
  });
});


*/
