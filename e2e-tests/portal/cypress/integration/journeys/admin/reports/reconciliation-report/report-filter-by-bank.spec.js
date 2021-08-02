const moment = require('moment');

const { reports, defaults } = require('../../../../pages');
const { reconciliationReport } = reports;

const relative = require('../../../../relativeURL');

const mockUsers = require('../../../../../fixtures/mockUsers');
const ADMIN_LOGIN = mockUsers.find( user=> (user.roles.includes('admin')) );
const BANK1_MAKER = mockUsers.find( user=> (user.roles.includes('maker') && user.bank.name === 'UKEF test bank (Delegated)') );
const BANK2_MAKER = mockUsers.find(user => (user.roles.includes('maker') && user.bank.name === 'UKEF test bank (Delegated) 2') );

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
    cy.deleteDeals(BANK1_MAKER);
    cy.deleteDeals(BANK2_MAKER);

    cy.insertOneDeal(aDealWithOneBond, BANK1_MAKER)
      .then( (inserted) => {
        const update = {
          details: {
            submissionDate: toBigNumber("2020-01-01"),
            status: "Submitted"
          }
        };
        cy.updateDeal(inserted._id, update, BANK1_MAKER);
      });

    cy.insertOneDeal(aDealWithOneLoan, BANK1_MAKER)
      .then( (inserted) => {
        const update = {
          details: {
            submissionDate: toBigNumber("2020-01-03"),
            status: "Submitted"
          }
        };

        cy.updateDeal(inserted._id, update, BANK1_MAKER);
      });

    cy.insertOneDeal(aDealWithOneLoanAndOneBond, BANK1_MAKER)
      .then( (inserted) => {
        const update = {
          details: {
            submissionDate: toBigNumber("2020-01-05"),
            status: "Submitted"
          }
        };

        cy.updateDeal(inserted._id, update, BANK1_MAKER);
      });

    cy.insertOneDeal(aDealWithTenBonds, BANK2_MAKER)
      .then( (inserted) => {
        const update = {
          details: {
            submissionDate: toBigNumber("2020-01-07"),
            status: "Submitted"
          }
        };

        cy.updateDeal(inserted._id, update, BANK2_MAKER);
      });

    cy.insertOneDeal(aDealWithTenLoans, BANK2_MAKER)
      .then( (inserted) => {
        const update = {
          details: {
            submissionDate: toBigNumber("2020-01-09"),
            status: "Submitted"
          }
        };

        cy.updateDeal(inserted._id, update, BANK2_MAKER);
      });

    cy.insertOneDeal(aDealWithTenLoansAndTenBonds, BANK2_MAKER)
      .then( (inserted) => {
        const update = {
          details: {
            submissionDate: toBigNumber("2020-01-11"),
            status: "Submitted"
          }
        };

        cy.updateDeal(inserted._id, update, BANK2_MAKER);
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
    reconciliationReport.filterByBank().select('9'); // UKEF test bank id
    reconciliationReport.applyFilters().click();
    reconciliationReport.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal('(3 items)');
    });

    reconciliationReport.bank().should((bank) => { expect(bank).to.contain('UKEF test bank (Delegated)')});
    reconciliationReport.bank().should( (bank) => { expect(bank).not.to.contain("HSBC")});
    reconciliationReport.bank().should( (bank) => { expect(bank).not.to.contain("LLOYDS")});
    reconciliationReport.bank().should( (bank) => { expect(bank).not.to.contain("RBS")});
    reconciliationReport.bank().should( (bank) => { expect(bank).not.to.contain("Santander")});
    reconciliationReport.bank().should((bank) => { expect(bank).not.to.contain('UKEF test bank (Delegated) 2')});

    reconciliationReport.filterByBank().should('have.value', '9'); // UKEF test bank id

    // can repeat this for other filters but not obvious how much value that brings
    //  i guess it proves we have all the right options as per the ACs... but not obvious it brings that much value..
  });
});
