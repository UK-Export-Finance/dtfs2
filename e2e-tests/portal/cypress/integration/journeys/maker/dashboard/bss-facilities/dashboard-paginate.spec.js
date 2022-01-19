/*
const { facilitiesDashboard } = require('../../../../pages');
const mockUsers = require('../../../../../fixtures/mockUsers');

const MAKER_LOGIN = mockUsers.find((user) => (user.roles.includes('maker')));

// test data we want to set up + work with..
const transactionTestData = require('../../../../../fixtures/transaction-dashboard-data');

context('The Transactions dashboard', () => {
  before(() => {
    cy.deleteDeals(MAKER_LOGIN);
    cy.insertManyDeals(transactionTestData.all, MAKER_LOGIN);
  });

  it('has pagination', () => {
    cy.login(MAKER_LOGIN);
    facilitiesDashboard.visit();

    facilitiesDashboard.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal('(44 items)');
    });

    facilitiesDashboard.results().find('tr').should('have.length', 20);

    facilitiesDashboard.next().click();
    facilitiesDashboard.results().find('tr').should('have.length', 20);

    facilitiesDashboard.next().click();
    facilitiesDashboard.results().find('tr').should('have.length', 4);

    facilitiesDashboard.previous().click();
    facilitiesDashboard.results().find('tr').should('have.length', 20);

    facilitiesDashboard.last().click();
    facilitiesDashboard.results().find('tr').should('have.length', 4);

    facilitiesDashboard.first().click();
    facilitiesDashboard.results().find('tr').should('have.length', 20);
  });
});
*/
