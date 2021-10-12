const { reports } = require('../../../../pages');
const mockUsers = require('../../../../../fixtures/mockUsers');

const { auditSupplyContracts } = reports;

const ADMIN_LOGIN = mockUsers.find((user) => (user.roles.includes('admin')));
const BANK1_MAKER = mockUsers.find((user) => (user.roles.includes('maker') && user.bank.name === 'UKEF test bank (Delegated)'));
const BANK2_MAKER = mockUsers.find((user) => (user.roles.includes('maker') && user.bank.name === 'UKEF test bank (Delegated) 2'));

// test data we want to set up + work with..
const {
  aDealWithOneBond,
  aDealWithOneLoan,
  aDealWithOneLoanAndOneBond,
  aDealWithTenLoans,
  aDealWithTenLoansAndTenBonds,
} = require('../../../../../fixtures/transaction-dashboard-data');

context('Audit - Report', () => {
  before(() => {
    cy.deleteDeals(ADMIN_LOGIN);
    cy.deleteDeals(BANK1_MAKER);
    cy.deleteDeals(BANK2_MAKER);

    cy.insertManyDeals([aDealWithOneBond, aDealWithTenLoans, aDealWithTenLoansAndTenBonds], BANK1_MAKER);
    cy.insertManyDeals([aDealWithOneLoan, aDealWithOneLoanAndOneBond, aDealWithTenLoans], BANK2_MAKER);
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

    auditSupplyContracts.bank().should((bank) => { expect(bank).to.contain('UKEF test bank (Delegated)'); });
    auditSupplyContracts.bank().should((bank) => { expect(bank).not.to.contain('HSBC'); });
    auditSupplyContracts.bank().should((bank) => { expect(bank).not.to.contain('LLOYDS'); });
    auditSupplyContracts.bank().should((bank) => { expect(bank).not.to.contain('RBS'); });
    auditSupplyContracts.bank().should((bank) => { expect(bank).not.to.contain('Santander'); });
    auditSupplyContracts.bank().should((bank) => { expect(bank).not.to.contain('UKEF test bank (Delegated) 2'); });

    auditSupplyContracts.filterByBank().should('have.value', '9'); // UKEF test bank id

    // can repeat this for other filters but not obvious how much value that brings
    // i guess it proves we have all the right options as per the ACs... but not obvious it brings that much value..
  });
});
