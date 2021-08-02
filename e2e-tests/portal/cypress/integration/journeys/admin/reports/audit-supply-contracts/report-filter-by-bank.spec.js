const { reports, defaults } = require('../../../../pages');
const { auditSupplyContracts } = reports;

const relative = require('../../../../relativeURL');

const mockUsers = require('../../../../../fixtures/mockUsers');
const ADMIN_LOGIN = mockUsers.find( user=> (user.roles.includes('admin')) );
const BANK1_MAKER = mockUsers.find( user=> (user.roles.includes('maker') && user.bank.name === 'UKEF test bank (Delegated)') );
const BANK2_MAKER = mockUsers.find(user => (user.roles.includes('maker') && user.bank.name === 'UKEF test bank (Delegated) 2') );

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
  let bank1Deals, bank2Deals;

  beforeEach(() => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });
  });

  before(() => {
    cy.deleteDeals(ADMIN_LOGIN);
    cy.deleteDeals(BANK1_MAKER);
    cy.deleteDeals(BANK2_MAKER);

    cy.insertManyDeals([aDealWithOneBond, aDealWithTenLoans, aDealWithTenLoansAndTenBonds], BANK1_MAKER)
      .then((insertedDeals) => bank1Deals = insertedDeals);

    cy.insertManyDeals([aDealWithOneLoan, aDealWithOneLoanAndOneBond, aDealWithTenLoans], BANK2_MAKER)
      .then((insertedDeals) => bank2Deals = insertedDeals);
  });

  it('can be filtered by bank', () => {
    cy.login(ADMIN_LOGIN);
    auditSupplyContracts.visit();

    auditSupplyContracts.filterByBank().select('Any');
    auditSupplyContracts.applyFilters().click();

    auditSupplyContracts.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal('(6 items)');
    });

    // filter by TFM Bank 1
    auditSupplyContracts.filterByBank().select('9'); // UKEF test bank id
    auditSupplyContracts.applyFilters().click();
    auditSupplyContracts.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal('(3 items)');
    });

    auditSupplyContracts.bank().should((bank) => { expect(bank).to.contain('UKEF test bank (Delegated)')});
    auditSupplyContracts.bank().should( (bank) => { expect(bank).not.to.contain("HSBC")});
    auditSupplyContracts.bank().should( (bank) => { expect(bank).not.to.contain("LLOYDS")});
    auditSupplyContracts.bank().should( (bank) => { expect(bank).not.to.contain("RBS")});
    auditSupplyContracts.bank().should( (bank) => { expect(bank).not.to.contain("Santander")});
    auditSupplyContracts.bank().should( (bank) => { expect(bank).not.to.contain("UKEF test bank (Delegated) 2")});

    auditSupplyContracts.filterByBank().should('have.value', '9'); // UKEF test bank id

    // can repeat this for other filters but not obvious how much value that brings
    //  i guess it proves we have all the right options as per the ACs... but not obvious it brings that much value..
  });
});
