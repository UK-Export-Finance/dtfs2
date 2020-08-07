const { dashboard } = require('../../../pages');

const mockUsers = require('../../../../fixtures/mockUsers');
const MAKER_LOGIN = mockUsers.find( user=> (user.roles.includes('maker')) );

// test data we want to set up + work with..
const twentyOneDeals = require('./twentyOneDeals');

context('The deals dashboard', () => {
  let deals;

  beforeEach(() => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });
  });

  before(() => {
    cy.deleteDeals(MAKER_LOGIN);
    // No need to add all test data
    cy.insertManyDeals(twentyOneDeals.slice(0, 6), MAKER_LOGIN)
      .then((insertedDeals) => deals = insertedDeals);
  });

  it('can be filtered by start date', () => {
    const nowDate = new Date();

    const date1 = {
      day: `${nowDate.getDate()}`,
      month: `${nowDate.getMonth() + 1}`,
      year: `${nowDate.getFullYear()}`,
    };

    cy.login(MAKER_LOGIN);
    dashboard.visit();

    dashboard.showFilters().click();

    dashboard.filterByStartDate.day().type(date1.day);
    dashboard.filterByStartDate.month().type(date1.month);
    dashboard.filterByStartDate.year().type(date1.year);

    dashboard.applyFilters().click();

    // all deals should be present
    dashboard.confirmDealsPresent(deals);

    // confirm the filter retains its state
    dashboard.filterByStartDate.day().should('be.visible');
    dashboard.filterByStartDate.day().should('have.value', date1.day);
    dashboard.filterByStartDate.month().should('have.value', date1.month);
    dashboard.filterByStartDate.year().should('have.value', date1.year);

    const tomorrow = new Date();
    tomorrow.setDate(nowDate.getDate() + 1);

    dashboard.filterByStartDate.day().clear().type(tomorrow.getDate());
    dashboard.filterByStartDate.month().clear().type(tomorrow.getMonth() + 1);
    dashboard.filterByStartDate.year().clear().type(tomorrow.getFullYear());
    dashboard.applyFilters().click();

    expect(dashboard.rows().should('not.exist'));
  });

  it('can be filtered by end date', () => {
    const nowDate = new Date();

    const date1 = {
      day: `${nowDate.getDate()}`,
      month: `${nowDate.getMonth() + 1}`,
      year: `${nowDate.getFullYear()}`,
    };

    cy.login(MAKER_LOGIN);
    dashboard.visit();

    dashboard.showFilters().click();

    dashboard.filterByEndDate.day().type(date1.day);
    dashboard.filterByEndDate.month().type(date1.month);
    dashboard.filterByEndDate.year().type(date1.year);

    dashboard.applyFilters().click();

    // all deals should be present
    dashboard.confirmDealsPresent(deals);

    // confirm the filter retains its state
    dashboard.filterByEndDate.day().should('be.visible');
    dashboard.filterByEndDate.day().should('have.value', date1.day);
    dashboard.filterByEndDate.month().should('have.value', date1.month);
    dashboard.filterByEndDate.year().should('have.value', date1.year);

    const yesterday = new Date();
    yesterday.setDate(nowDate.getDate() - 1);

    dashboard.filterByEndDate.day().clear().type(yesterday.getDate());
    dashboard.filterByEndDate.month().clear().type(yesterday.getMonth() + 1);
    dashboard.filterByEndDate.year().clear().type(yesterday.getFullYear());
    dashboard.applyFilters().click();

    expect(dashboard.rows().should('not.exist'));
  });
});
