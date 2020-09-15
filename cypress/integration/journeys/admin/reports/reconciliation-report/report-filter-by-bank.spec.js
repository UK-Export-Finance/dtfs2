const { reports, defaults } = require('../../../../pages');
const { reconciliationReport } = reports;

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

context('reconciliation report', () => {
  let barclaysDeals, hsbcDeals;

  beforeEach(() => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });
  });

  before(() => {
    cy.deleteDeals(ADMIN_LOGIN);
    cy.deleteDeals(BARCLAYS_LOGIN);
    cy.deleteDeals(HSBC_LOGIN);

    cy.insertManyDeals([aDealWithOneBond, aDealWithTenLoans, aDealWithTenLoansAndTenBonds], BARCLAYS_LOGIN)
      .then((insertedDeals) => barclaysDeals = insertedDeals);

    cy.insertManyDeals([aDealWithOneLoan, aDealWithOneLoanAndOneBond, aDealWithTenLoans], HSBC_LOGIN)
      .then((insertedDeals) => hsbcDeals = insertedDeals);
  });

  it('can be filtered by bank', () => {
    cy.login(ADMIN_LOGIN);
    reconciliationReport.visit();

    reconciliationReport.filterByBank().select('Any');
    reconciliationReport.applyFilters().click();

    reconciliationReport.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal('(6 items)');
    });

    // filter by barclays
    reconciliationReport.filterByBank().select('956'); //Barclays
    reconciliationReport.applyFilters().click();
    reconciliationReport.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal('(3 items)');
    });

    reconciliationReport.bank().should( (bank) => { expect(bank).to.contain("Barclays Bank")});
    reconciliationReport.bank().should( (bank) => { expect(bank).not.to.contain("HSBC")});
    reconciliationReport.bank().should( (bank) => { expect(bank).not.to.contain("LLOYDS")});
    reconciliationReport.bank().should( (bank) => { expect(bank).not.to.contain("RBS")});
    reconciliationReport.bank().should( (bank) => { expect(bank).not.to.contain("Santander")});
    reconciliationReport.bank().should( (bank) => { expect(bank).not.to.contain("UKEF test bank (Delegated)")});

    reconciliationReport.filterByBank().should('have.value', '956');

    // can repeat this for other filters but not obvious how much value that brings
    //  i guess it proves we have all the right options as per the ACs... but not obvious it brings that much value..
  });
});
