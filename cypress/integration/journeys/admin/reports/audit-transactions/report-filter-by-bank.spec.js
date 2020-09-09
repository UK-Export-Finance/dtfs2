const { reports, defaults } = require('../../../../pages');
const { auditTransactionsReport } = reports;

const relative = require('../../../../relativeURL');

const mockUsers = require('../../../../../fixtures/mockUsers');
const ADMIN_LOGIN = mockUsers.find( user=> (user.roles.includes('admin')) );
const BARCLAYS_LOGIN = mockUsers.find( user=> (user.roles.includes('maker') && user.bank.name === 'Barclays Bank') );
const HSBC_LOGIN = mockUsers.find( user=> (user.roles.includes('maker') && user.bank.name === 'HSBC') );

// test data we want to set up + work with..
let {aDealWithOneBond, aDealWithOneLoan, aDealWithOneLoanAndOneBond} = require('../../../../../fixtures/transaction-dashboard-data');

context('Audit - Transactions Report (viewed by an admin user)', () => {
  let deals;

  before(() => {
    cy.deleteDeals(BARCLAYS_LOGIN);
    cy.deleteDeals(HSBC_LOGIN);

    cy.insertOneDeal(aDealWithOneBond, BARCLAYS_LOGIN)
      .then( (inserted) => {aDealWithOneBond = inserted});

    cy.insertOneDeal(aDealWithOneLoan, BARCLAYS_LOGIN)
      .then( (inserted) => {aDealWithOneLoan = inserted});

    cy.insertOneDeal(aDealWithOneLoanAndOneBond, HSBC_LOGIN)
      .then( (inserted) => {aDealWithOneLoanAndOneBond = inserted});

  });

  it('can be filtered by bank', () => {
    cy.login(ADMIN_LOGIN);
    auditTransactionsReport.visit();

    auditTransactionsReport.filterByBank().select('956'); // Barclays. for some reason.
    auditTransactionsReport.applyFilters().click();
    auditTransactionsReport.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal('(2 items)');
    });

    auditTransactionsReport.filterByBank().select('961'); // HSBC. for some reason.
    auditTransactionsReport.applyFilters().click();
    auditTransactionsReport.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal('(2 items)');
    });

  });
});
