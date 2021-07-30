const { reports } = require('../../../../pages');
const { auditSupplyContracts } = reports;

const mockUsers = require('../../../../../fixtures/mockUsers');
const BANK1_MAKER = mockUsers.find( user=> (user.roles.includes('maker') && user.bank.name === 'UKEF test bank (Delegated)') );
const BANK2_MAKERS = mockUsers.filter(user => (user.roles.includes('maker') && user.bank.name === 'UKEF test bank (Delegated) 2') );
const BANK2_MAKER_1 = BANK2_MAKERS[0];
const BANK2_MAKER_2 = BANK2_MAKERS[1];

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
  let barclaysDeals, hsbcDeals = [];

  beforeEach(() => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });
  });

  before(() => {
    cy.deleteDeals(BANK1_MAKER);
    cy.deleteDeals(BANK2_MAKER_1);
    cy.deleteDeals(BANK2_MAKER_2);

    cy.insertManyDeals([aDealWithOneBond, aDealWithTenLoans], BANK1_MAKER)
      .then((insertedDeals) => barclaysDeals = insertedDeals);

    cy.insertManyDeals([aDealWithTenLoansAndTenBonds, aDealWithOneLoan], BANK2_MAKER_1)
      .then((insertedDeals) => hsbcDeals.push(insertedDeals));

    cy.insertManyDeals([aDealWithOneLoanAndOneBond, aDealWithTenLoans], BANK2_MAKER_2)
      .then((insertedDeals) => hsbcDeals.push(insertedDeals));
  });

  it('can be filtered by bank', () => {
    cy.login(BANK2_MAKER_1);
    auditSupplyContracts.visit();

    auditSupplyContracts.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal('(4 items)');
    });

  });
});
