const { reports } = require('../../../../pages');
const mockUsers = require('../../../../../fixtures/mockUsers');

const { auditSupplyContracts } = reports;

const ADMIN_LOGIN = mockUsers.find((user) => (user.roles.includes('admin')));

// test data we want to set up + work with..
let { aDealWithOneBond, aDealWithOneLoan, aDealWithOneLoanAndOneBond } = require('../../../../../fixtures/transaction-dashboard-data');

const toBigNumber = (date) => new Date(date).valueOf().toString();

context('Audit - Report', () => {
  before(() => {
    cy.deleteDeals(ADMIN_LOGIN);

    cy.insertOneDeal(aDealWithOneBond, ADMIN_LOGIN)
      .then((inserted) => {
        cy.updateDeal(inserted._id, { details: { created: toBigNumber('2020-01-01') } }, ADMIN_LOGIN)
          .then((updated) => { aDealWithOneBond = updated; });
      });

    cy.insertOneDeal(aDealWithOneLoan, ADMIN_LOGIN)
      .then((inserted) => {
        cy.updateDeal(inserted._id, { details: { created: toBigNumber('2020-01-03') } }, ADMIN_LOGIN)
          .then((updated) => { aDealWithOneLoan = updated; });
      });

    cy.insertOneDeal(aDealWithOneLoanAndOneBond, ADMIN_LOGIN)
      .then((inserted) => {
        cy.updateDeal(inserted._id, { details: { created: toBigNumber('2020-01-05') } }, ADMIN_LOGIN)
          .then((updated) => { aDealWithOneLoanAndOneBond = updated; });
      });
  });

  it('can be filtered by create date', () => {
    cy.login(ADMIN_LOGIN);
    auditSupplyContracts.visit();

    //-----
    // unfiltered..
    //  if this fails the test data has been changed and the rest of the tests should
    //  be looked at to see if they make sense against the new data...
    //-----
    auditSupplyContracts.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal('(3 items)'); // based on the test data
    });

    // select the earliest date our data should match and check we still get everything
    auditSupplyContracts.filterByStartDate.day().type('{selectall}{backspace}01');
    auditSupplyContracts.filterByStartDate.month().type('{selectall}{backspace}01');
    auditSupplyContracts.filterByStartDate.year().type('{selectall}{backspace}2020');
    auditSupplyContracts.applyFilters().click();
    auditSupplyContracts.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal('(3 items)');
    });

    // go forwards a day, we should see one less transaction..
    auditSupplyContracts.filterByStartDate.day().type('{selectall}{backspace}02');
    auditSupplyContracts.filterByStartDate.month().type('{selectall}{backspace}01');
    auditSupplyContracts.filterByStartDate.year().type('{selectall}{backspace}2020');
    auditSupplyContracts.applyFilters().click();
    auditSupplyContracts.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal('(2 items)');
    });

    // add a restriction on the end date before our last deal, and now we should only see 1 transaction..
    auditSupplyContracts.filterByEndDate.day().type('{selectall}{backspace}04');
    auditSupplyContracts.filterByEndDate.month().type('{selectall}{backspace}01');
    auditSupplyContracts.filterByEndDate.year().type('{selectall}{backspace}2020');
    auditSupplyContracts.applyFilters().click();
    auditSupplyContracts.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal('(1 items)');
    });

    // confirm that the date fields are in the last state we left them..
    auditSupplyContracts.filterByStartDate.day().should('have.value', '02');
    auditSupplyContracts.filterByStartDate.month().should('have.value', '01');
    auditSupplyContracts.filterByStartDate.year().should('have.value', '2020');
    auditSupplyContracts.filterByEndDate.day().should('have.value', '04');
    auditSupplyContracts.filterByEndDate.month().should('have.value', '01');
    auditSupplyContracts.filterByEndDate.year().should('have.value', '2020');
  });
});
