const moment = require('moment');

const { reports, defaults } = require('../../../../pages');
const { reconciliationReport } = reports;

const relative = require('../../../../relativeURL');

const mockUsers = require('../../../../../fixtures/mockUsers');
const ADMIN_LOGIN = mockUsers.find( user=> (user.roles.includes('admin')) );
const MAKER_LOGIN = mockUsers.find( user=> (user.roles.includes('maker') && !user.roles.includes('admin')) );

const nowMinus = (minutes) => {
  return moment().subtract(minutes, 'minutes').utc().valueOf().toString();
}

const {
  aDealWithOneBond,
  aDealWithOneLoan,
  aDealWithOneLoanAndOneBond,
 } = require('../../../../../fixtures/transaction-dashboard-data');

context('reconciliation report', () => {
  let deals;

  beforeEach(() => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });
  });

  before(() => {
    cy.deleteDeals(MAKER_LOGIN);
    cy.insertOneDeal(aDealWithOneBond, MAKER_LOGIN)
      .then( (inserted) => {
        const update = {
          details: {
            submissionDate: nowMinus(100),
            status: "Submitted"
          }
        };
        cy.updateDeal(inserted._id, update, MAKER_LOGIN);
      });

    cy.insertOneDeal(aDealWithOneLoan, MAKER_LOGIN)
      .then( (inserted) => {
        const update = {
          details: {
            submissionDate: nowMinus(118),
            status: "Submitted"
          }
        };

        cy.updateDeal(inserted._id, update, MAKER_LOGIN);
      });

    cy.insertOneDeal(aDealWithOneLoanAndOneBond, MAKER_LOGIN)
      .then( (inserted) => {
        const update = {
          details: {
            submissionDate: nowMinus(121),
            status: "Submitted"
          }
        };

        cy.updateDeal(inserted._id, update, MAKER_LOGIN);
      });

  });

  it('should not show deals submitted within the last 2 hours', () => {
    cy.login(ADMIN_LOGIN);
    reconciliationReport.visit();

    reconciliationReport.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal('(1 items)');
    });

  });
});
