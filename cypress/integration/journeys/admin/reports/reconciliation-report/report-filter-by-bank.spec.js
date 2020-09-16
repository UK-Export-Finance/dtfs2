const moment = require('moment');

const { reports, defaults } = require('../../../../pages');
const { reconciliationReport } = reports;

const relative = require('../../../../relativeURL');

const mockUsers = require('../../../../../fixtures/mockUsers');
const ADMIN_LOGIN = mockUsers.find( user=> (user.roles.includes('admin')) );
const BARCLAYS_LOGIN = mockUsers.find( user=> (user.roles.includes('maker') && user.bank.name === 'Barclays Bank') );
const HSBC_LOGIN = mockUsers.find( user=> (user.roles.includes('maker') && user.bank.name === 'HSBC') );

const toBigNumber = (date) => {
  return moment(date, "YYYY-MM-DD").utc().valueOf().toString();
}

const {
  aDealWithOneBond,
  aDealWithOneLoan,
  aDealWithOneLoanAndOneBond,
  aDealWithTenBonds,
  aDealWithTenLoans,
  aDealWithTenLoansAndTenBonds,
 } = require('../../../../../fixtures/transaction-dashboard-data');

context('reconciliation report', () => {
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

    cy.insertOneDeal(aDealWithOneBond, BARCLAYS_LOGIN)
      .then( (inserted) => {
        const update = {
          details: {
            submissionDate: toBigNumber("2020-01-01"),
            status: "Submitted"
          }
        };
        cy.updateDeal(inserted._id, update, BARCLAYS_LOGIN);
      });

    cy.insertOneDeal(aDealWithOneLoan, BARCLAYS_LOGIN)
      .then( (inserted) => {
        const update = {
          details: {
            submissionDate: toBigNumber("2020-01-03"),
            status: "Submitted"
          }
        };

        cy.updateDeal(inserted._id, update, BARCLAYS_LOGIN);
      });

    cy.insertOneDeal(aDealWithOneLoanAndOneBond, BARCLAYS_LOGIN)
      .then( (inserted) => {
        const update = {
          details: {
            submissionDate: toBigNumber("2020-01-05"),
            status: "Submitted"
          }
        };

        cy.updateDeal(inserted._id, update, BARCLAYS_LOGIN);
      });

    cy.insertOneDeal(aDealWithTenBonds, HSBC_LOGIN)
      .then( (inserted) => {
        const update = {
          details: {
            submissionDate: toBigNumber("2020-01-07"),
            status: "Submitted"
          }
        };

        cy.updateDeal(inserted._id, update, HSBC_LOGIN);
      });

    cy.insertOneDeal(aDealWithTenLoans, HSBC_LOGIN)
      .then( (inserted) => {
        const update = {
          details: {
            submissionDate: toBigNumber("2020-01-09"),
            status: "Submitted"
          }
        };

        cy.updateDeal(inserted._id, update, HSBC_LOGIN);
      });

    cy.insertOneDeal(aDealWithTenLoansAndTenBonds, HSBC_LOGIN)
      .then( (inserted) => {
        const update = {
          details: {
            submissionDate: toBigNumber("2020-01-11"),
            status: "Submitted"
          }
        };

        cy.updateDeal(inserted._id, update, HSBC_LOGIN);
      });

  });

  it('can be filtered by bank', () => {
    cy.login(ADMIN_LOGIN);
    reconciliationReport.visit();

    reconciliationReport.filterByBank().select('Any');
    reconciliationReport.applyFilters().click();

    reconciliationReport.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal('(6 items)');
    });

    // filter by barclays
    reconciliationReport.filterByBank().select('956'); //Barclays
    reconciliationReport.applyFilters().click();
    reconciliationReport.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal('(3 items)');
    });

    reconciliationReport.bank().should( (bank) => { expect(bank).to.contain("Barclays Bank")});
    reconciliationReport.bank().should( (bank) => { expect(bank).not.to.contain("HSBC")});
    reconciliationReport.bank().should( (bank) => { expect(bank).not.to.contain("LLOYDS")});
    reconciliationReport.bank().should( (bank) => { expect(bank).not.to.contain("RBS")});
    reconciliationReport.bank().should( (bank) => { expect(bank).not.to.contain("Santander")});
    reconciliationReport.bank().should( (bank) => { expect(bank).not.to.contain("UKEF test bank (Delegated)")});

    reconciliationReport.filterByBank().should('have.value', '956');

    // can repeat this for other filters but not obvious how much value that brings
    //  i guess it proves we have all the right options as per the ACs... but not obvious it brings that much value..
  });
});
