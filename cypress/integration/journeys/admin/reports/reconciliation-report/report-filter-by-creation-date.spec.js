const moment = require('moment');

const { reports, defaults } = require('../../../../pages');
const { reconciliationReport } = reports;

const relative = require('../../../../relativeURL');

const mockUsers = require('../../../../../fixtures/mockUsers');
const ADMIN_LOGIN = mockUsers.find( user=> (user.roles.includes('admin')) );
const BARCLAYS_LOGIN = mockUsers.find( user=> (user.roles.includes('maker') && user.bank.name === 'Barclays Bank') );
const HSBC_LOGIN = mockUsers.find( user=> (user.roles.includes('maker') && user.bank.name === 'HSBC') );

// test data we want to set up + work with..
let {aDealWithOneBond, aDealWithOneLoan, aDealWithOneLoanAndOneBond} = require('../../../../../fixtures/transaction-dashboard-data');

const toBigNumber = (date) => {
  return moment(date, "YYYY-MM-DD").utc().valueOf().toString();
}

context('reconciliation report', () => {
  let deals;

  beforeEach(() => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });
  });

  before(() => {
    cy.deleteDeals(BARCLAYS_LOGIN); // getting ugly but this report will pick up -anything- lying around
    cy.deleteDeals(HSBC_LOGIN);     //   so have to clean out any data created by the users in previous tests...

    cy.insertOneDeal(aDealWithOneBond, BARCLAYS_LOGIN)
      .then( (inserted) => {
        cy.updateDeal(inserted._id, {details: {created: toBigNumber("2020-01-01")}}, BARCLAYS_LOGIN)
          .then( (updated) => {aDealWithOneBond = updated});
      });

    cy.insertOneDeal(aDealWithOneLoan, BARCLAYS_LOGIN)
      .then( (inserted) => {
        cy.updateDeal(inserted._id, {details: {created: toBigNumber("2020-01-03")}}, BARCLAYS_LOGIN)
          .then( (updated) => {aDealWithOneLoan = updated});
      });

    cy.insertOneDeal(aDealWithOneLoanAndOneBond, BARCLAYS_LOGIN)
      .then( (inserted) => {
        cy.updateDeal(inserted._id, {details: {created: toBigNumber("2020-01-05")}}, BARCLAYS_LOGIN)
          .then( (updated) => {aDealWithOneLoanAndOneBond = updated});
      });

  });

  it('can be filtered by create date', () => {
    cy.login(ADMIN_LOGIN);
    reconciliationReport.visit();

    //-----
    // unfiltered..
    //  if this fails the test data has been changed and the rest of the tests should
    //  be looked at to see if they make sense against the new data...
    //-----
    reconciliationReport.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal('(3 items)'); //based on the test data
    });

    // select the earliest date our data should match and check we still get everything
    reconciliationReport.filterByStartDate.day().type('{selectall}{backspace}01');
    reconciliationReport.filterByStartDate.month().type('{selectall}{backspace}01');
    reconciliationReport.filterByStartDate.year().type('{selectall}{backspace}2020');
    reconciliationReport.applyFilters().click();
    reconciliationReport.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal('(3 items)');
    });

    // go forwards a day, we should see one less transaction..
    reconciliationReport.filterByStartDate.day().type('{selectall}{backspace}02');
    reconciliationReport.filterByStartDate.month().type('{selectall}{backspace}01');
    reconciliationReport.filterByStartDate.year().type('{selectall}{backspace}2020');
    reconciliationReport.applyFilters().click();
    reconciliationReport.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal('(2 items)');
    });

    // add a restriction on the end date before our last deal, and now we should only see 1 transaction..
    reconciliationReport.filterByEndDate.day().type('{selectall}{backspace}04');
    reconciliationReport.filterByEndDate.month().type('{selectall}{backspace}01');
    reconciliationReport.filterByEndDate.year().type('{selectall}{backspace}2020');
    reconciliationReport.applyFilters().click();
    reconciliationReport.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal('(1 items)');
    });

    // confirm that the date fields are in the last state we left them..
    reconciliationReport.filterByStartDate.day().should('have.value', '02');
    reconciliationReport.filterByStartDate.month().should('have.value', '01');
    reconciliationReport.filterByStartDate.year().should('have.value', '2020');
    reconciliationReport.filterByEndDate.day().should('have.value', '04');
    reconciliationReport.filterByEndDate.month().should('have.value', '01');
    reconciliationReport.filterByEndDate.year().should('have.value', '2020');

  });
});
