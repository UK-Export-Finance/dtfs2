const moment = require('moment');

const { transactionDashboard } = require('../../../../pages');
const relative = require('../../../../relativeURL');

const mockUsers = require('../../../../../fixtures/mockUsers');
const MAKER_LOGIN = mockUsers.find( user=> (user.roles.includes('maker')) );

// test data we want to set up + work with..
let {aDealWithOneBond, aDealWithOneLoan, aDealWithOneLoanAndOneBond} = require('../../../../../fixtures/transaction-dashboard-data');

const toBigNumber = (date) => {
  return moment(date, "YYYY-MM-DD").utc().valueOf().toString();
}

context('The Transactions dashboard', () => {
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

    cy.insertOneDeal(aDealWithOneBond, MAKER_LOGIN)
      .then( (inserted) => {
        cy.updateDeal(inserted._id, {details: {created: toBigNumber("2020-01-01")}}, MAKER_LOGIN)
          .then( (updated) => {aDealWithOneBond = updated});
      });

    cy.insertOneDeal(aDealWithOneLoan, MAKER_LOGIN)
      .then( (inserted) => {
        cy.updateDeal(inserted._id, {details: {created: toBigNumber("2020-01-03")}}, MAKER_LOGIN)
          .then( (updated) => {aDealWithOneLoan = updated});
      });

    cy.insertOneDeal(aDealWithOneLoanAndOneBond, MAKER_LOGIN)
      .then( (inserted) => {
        cy.updateDeal(inserted._id, {details: {created: toBigNumber("2020-01-05")}}, MAKER_LOGIN)
          .then( (updated) => {aDealWithOneLoanAndOneBond = updated});
      });

  });

  it('can be filtered by create date', () => {
    cy.login(MAKER_LOGIN);
    transactionDashboard.visit();

    //-----
    // unfiltered..
    //  if this fails the test data has been changed and the rest of the tests should
    //  be looked at to see if they make sense against the new data...
    //-----
    transactionDashboard.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal('(4 items)'); //based on the test data
    });

    // select the earliest date our data should match and check we still get everything
    transactionDashboard.showFilters().click();
    transactionDashboard.filterByStartDate.day().type('{selectall}{backspace}01');
    transactionDashboard.filterByStartDate.month().type('{selectall}{backspace}01');
    transactionDashboard.filterByStartDate.year().type('{selectall}{backspace}2020');
    transactionDashboard.applyFilters().click();
    transactionDashboard.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal('(4 items)');
    });

    // go forwards a day, we should see one less transaction..
    // NB also testing that if there are values in the date fields we default to
    //  rendering the advanced search options, so don't need to call showFilters()...
    transactionDashboard.filterByStartDate.day().type('{selectall}{backspace}02');
    transactionDashboard.filterByStartDate.month().type('{selectall}{backspace}01');
    transactionDashboard.filterByStartDate.year().type('{selectall}{backspace}2020');
    transactionDashboard.applyFilters().click();
    transactionDashboard.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal('(3 items)');
    });

    // add a restriction on the end date before our last deal, and now we should only see 1 transaction..
    transactionDashboard.filterByEndDate.day().type('{selectall}{backspace}04');
    transactionDashboard.filterByEndDate.month().type('{selectall}{backspace}01');
    transactionDashboard.filterByEndDate.year().type('{selectall}{backspace}2020');
    transactionDashboard.applyFilters().click();
    transactionDashboard.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal('(1 items)');
    });


    // confirm that the date fields are in the last state we left them..
    transactionDashboard.filterByStartDate.day().should('have.value', '02');
    transactionDashboard.filterByStartDate.month().should('have.value', '01');
    transactionDashboard.filterByStartDate.year().should('have.value', '2020');
    transactionDashboard.filterByEndDate.day().should('have.value', '04');
    transactionDashboard.filterByEndDate.month().should('have.value', '01');
    transactionDashboard.filterByEndDate.year().should('have.value', '2020');

  });
});
