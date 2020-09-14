const { reports, defaults } = require('../../../../pages');
const { auditSupplyContracts } = reports;

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

context('Audit - Report', () => {
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
    auditSupplyContracts.visit();

    auditSupplyContracts.filterByBank().select('Any');
    auditSupplyContracts.applyFilters().click();

    auditSupplyContracts.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal('(6 items)');
    });

    // filter by barclays
    auditSupplyContracts.filterByBank().select('956'); //Barclays
    auditSupplyContracts.applyFilters().click();
    auditSupplyContracts.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal('(3 items)');
    });

    auditSupplyContracts.bank().should( (bank) => { expect(bank).to.contain("Barclays Bank")});
    auditSupplyContracts.bank().should( (bank) => { expect(bank).not.to.contain("HSBC")});
    auditSupplyContracts.bank().should( (bank) => { expect(bank).not.to.contain("LLOYDS")});
    auditSupplyContracts.bank().should( (bank) => { expect(bank).not.to.contain("RBS")});
    auditSupplyContracts.bank().should( (bank) => { expect(bank).not.to.contain("Santander")});
    auditSupplyContracts.bank().should( (bank) => { expect(bank).not.to.contain("UKEF test bank (Delegated)")});

    auditSupplyContracts.filterByBank().should('have.value', '956');

    // can repeat this for other filters but not obvious how much value that brings
    //  i guess it proves we have all the right options as per the ACs... but not obvious it brings that much value..
  });
});
