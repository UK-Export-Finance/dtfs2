const { reports, defaults } = require('../../../../pages');
const { auditSupplyContracts } = reports;

const relative = require('../../../../relativeURL');

const mockUsers = require('../../../../../fixtures/mockUsers');
const BARCLAYS_LOGIN = mockUsers.find( user=> (user.roles.includes('maker') && user.bank.name === 'Barclays Bank') );
const hsbc_makers = mockUsers.filter( user=> (user.roles.includes('maker') && user.bank.name === 'HSBC') );
const HSBC_MAKER_1 = hsbc_makers[0];
const HSBC_MAKER_2 = hsbc_makers[1];

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
    cy.deleteDeals(BARCLAYS_LOGIN);
    cy.deleteDeals(HSBC_MAKER_1);
    cy.deleteDeals(HSBC_MAKER_2);

    cy.insertManyDeals([aDealWithOneBond, aDealWithTenLoans], BARCLAYS_LOGIN)
      .then((insertedDeals) => barclaysDeals = insertedDeals);

    cy.insertManyDeals([aDealWithTenLoansAndTenBonds, aDealWithOneLoan], HSBC_MAKER_1)
      .then((insertedDeals) => hsbcDeals.push(insertedDeals));

    cy.insertManyDeals([aDealWithOneLoanAndOneBond, aDealWithTenLoans], HSBC_MAKER_2)
      .then((insertedDeals) => hsbcDeals.push(insertedDeals));
  });

  it('can be filtered by bank', () => {
    cy.login(HSBC_MAKER_1);
    auditSupplyContracts.visit();

    auditSupplyContracts.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal('(4 items)');
    });

  });
});
