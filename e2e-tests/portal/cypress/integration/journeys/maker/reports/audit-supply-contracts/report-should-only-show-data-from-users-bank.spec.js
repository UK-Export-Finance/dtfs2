const { reports: { auditSupplyContracts } } = require('../../../../pages');
const {
  aDealWithOneBond,
  aDealWithOneLoan,
  aDealWithTenLoans,
  aDealWithTenLoansAndTenBonds,
} = require('../../../../../fixtures/transaction-dashboard-data');
const mockUsers = require('../../../../../fixtures/mockUsers');

const BANK1_MAKER = mockUsers.find((user) => (user.roles.includes('maker') && user.bank.name === 'UKEF test bank (Delegated)'));
const BANK1_MAKER_CHECKER = mockUsers.find((user) => (user.roles.includes('maker') && user.roles.includes('checker') && user.bank.name === 'UKEF test bank (Delegated)'));
const BANK2_MAKER = mockUsers.find((user) => (user.roles.includes('maker') && user.bank.name === 'UKEF test bank (Delegated) 2'));

context('Audit - Report', () => {
  let bank1Deals = [];

  before(() => {
    cy.deleteDeals(BANK1_MAKER);
    cy.deleteDeals(BANK2_MAKER);

    cy.insertManyDeals([aDealWithOneBond, aDealWithTenLoans], BANK1_MAKER).then((insertedDeals) => {
      bank1Deals = [...bank1Deals, ...insertedDeals];
    });

    cy.insertManyDeals([aDealWithOneBond], BANK1_MAKER_CHECKER).then((insertedDeals) => {
      bank1Deals = [...bank1Deals, ...insertedDeals];
    });

    cy.insertManyDeals([aDealWithTenLoansAndTenBonds, aDealWithOneLoan], BANK2_MAKER);
  });

  it('can be filtered by bank', () => {
    cy.login(BANK1_MAKER);
    auditSupplyContracts.visit();

    auditSupplyContracts.totalItems().invoke('text').then((text) => {
      const expected = `(${bank1Deals.length} items)`;
      expect(text.trim()).equal(expected);
    });
  });
});
