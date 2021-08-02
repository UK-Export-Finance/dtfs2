const { reports } = require('../../../../pages');
const { auditSupplyContracts } = reports;

const mockUsers = require('../../../../../fixtures/mockUsers');
const BANK1_MAKER = mockUsers.find((user) => (user.roles.includes('maker') && user.bank.name === 'UKEF test bank (Delegated)'));
const BANK2_MAKER = mockUsers.find((user) => (user.roles.includes('maker') && user.bank.name === 'UKEF test bank (Delegated) 2'));

const {
  aDealWithOneBond,
  aDealWithOneLoan,
  aDealWithTenLoans,
  aDealWithTenLoansAndTenBonds,
} = require('../../../../../fixtures/transaction-dashboard-data');

context('Audit - Report', () => {
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

    cy.insertManyDeals([aDealWithOneBond, aDealWithTenLoans], BANK1_MAKER);

    cy.insertManyDeals([aDealWithTenLoansAndTenBonds, aDealWithOneLoan], BANK2_MAKER);
  });

  it('can be filtered by bank', () => {
    cy.login(BANK2_MAKER);
    auditSupplyContracts.visit();

    auditSupplyContracts.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal('(2 items)');
    });
  });
});
