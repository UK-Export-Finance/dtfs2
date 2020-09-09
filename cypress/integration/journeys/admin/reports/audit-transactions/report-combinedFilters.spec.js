const { reports, defaults } = require('../../../../pages');
const { auditTransactionsReport } = reports;

const relative = require('../../../../relativeURL');

const mockUsers = require('../../../../../fixtures/mockUsers');
const ADMIN_LOGIN = mockUsers.find( user=> (user.roles.includes('admin')) );
const BARCLAYS_LOGIN = mockUsers.find( user=> (user.roles.includes('maker') && user.bank.name === 'Barclays Bank') );
const HSBC_LOGIN = mockUsers.find( user=> (user.roles.includes('maker') && user.bank.name === 'HSBC') );

// test data we want to set up + work with..
let {
  aDealWithOneBond,
  aDealWithOneLoan,
  aDealWithOneLoanAndOneBond,
  aDealWithTenBonds,
  aDealWithTenLoans,
  aDealWithTenLoansAndTenBonds,
 } = require('../../../../../fixtures/transaction-dashboard-data');

context('Audit - Transactions Report (viewed by an admin user)', () => {
  let barclaysDeals, hsbcDeals;

  before(() => {
    cy.deleteDeals(BARCLAYS_LOGIN);
    cy.deleteDeals(HSBC_LOGIN);

    cy.insertManyDeals([aDealWithOneBond, aDealWithTenLoans, aDealWithTenLoansAndTenBonds], BARCLAYS_LOGIN)
      .then((insertedDeals) => barclaysDeals = insertedDeals);

    cy.insertManyDeals([aDealWithOneLoan, aDealWithOneLoanAndOneBond, aDealWithTenLoans], HSBC_LOGIN)
      .then((insertedDeals) => hsbcDeals = insertedDeals);

  });

  it('works with multiple filters', () => {
    cy.login(ADMIN_LOGIN);
    auditTransactionsReport.visit();

    // filter -> hsbc
    auditTransactionsReport.filterByBank().select('961'); // HSBC. for some reason.
    auditTransactionsReport.applyFilters().click();
    auditTransactionsReport.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal('(13 items)');
    });

    // select a stage
    auditTransactionsReport.filterByFacilityStage().select('unissued_conditional');
    auditTransactionsReport.applyFilters().click();
    auditTransactionsReport.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal('(7 items)');
    });

    // filter by ukef id
    auditTransactionsReport.filterByUKEFSupplyContractId().type('{selectall}{backspace}ukef:adealwithten');
    auditTransactionsReport.applyFilters().click();
    auditTransactionsReport.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal('(5 items)');
    });

    // -> created before the industrial revolution
    auditTransactionsReport.filterByEndDate.day().type('{selectall}{backspace}01');
    auditTransactionsReport.filterByEndDate.month().type('{selectall}{backspace}01');
    auditTransactionsReport.filterByEndDate.year().type('{selectall}{backspace}1895');
    auditTransactionsReport.applyFilters().click();
    auditTransactionsReport.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal('(0 items)');
    });

  });
});
