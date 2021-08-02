const { reports, defaults } = require('../../../../pages');
const { auditTransactionsReport } = reports;

const relative = require('../../../../relativeURL');

const mockUsers = require('../../../../../fixtures/mockUsers');
const ADMIN_LOGIN = mockUsers.find( user=> (user.roles.includes('admin')) );
const BANK1_MAKER = mockUsers.find( user=> (user.roles.includes('maker') && user.bank.name === 'UKEF test bank (Delegated)') );
const BANK2_MAKER = mockUsers.find(user => (user.roles.includes('maker') && user.bank.name === 'UKEF test bank (Delegated) 2') );

// test data we want to set up + work with..
let {aDealWithOneBond, aDealWithOneLoan, aDealWithOneLoanAndOneBond} = require('../../../../../fixtures/transaction-dashboard-data');

context('Audit - Transactions Report (viewed by an admin user)', () => {
  let deals;

  beforeEach(() => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });
  });

  before(() => {
    cy.deleteDeals(BANK1_MAKER);
    cy.deleteDeals(BANK2_MAKER);

    cy.insertOneDeal(aDealWithOneBond, BANK1_MAKER)
      .then( (inserted) => {aDealWithOneBond = inserted});

    cy.insertOneDeal(aDealWithOneLoan, BANK1_MAKER)
      .then( (inserted) => {aDealWithOneLoan = inserted});

    cy.insertOneDeal(aDealWithOneLoanAndOneBond, BANK2_MAKER)
      .then( (inserted) => {aDealWithOneLoanAndOneBond = inserted});

  });

  it('can be filtered by bank', () => {
    cy.login(ADMIN_LOGIN);
    auditTransactionsReport.visit();

    auditTransactionsReport.filterByBank().select('9'); // TFM Bank 1 id
    auditTransactionsReport.applyFilters().click();
    auditTransactionsReport.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal('(2 items)');
    });

    auditTransactionsReport.filterByBank().select('10'); // TFM Bank 2 id
    auditTransactionsReport.applyFilters().click();
    auditTransactionsReport.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal('(2 items)');
    });

  });
});
