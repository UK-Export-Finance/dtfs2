const { transactionDashboard } = require('../../../../pages');
const relative = require('../../../../relativeURL');

const mockUsers = require('../../../../../fixtures/mockUsers');
// slight oddity- this test seems to need a straight 'maker'; so filtering slightly more than in other tests..
const MAKER_LOGIN = mockUsers.find(
  user=> (user.roles.includes('maker')
    && !user.roles.includes('admin')
    && !user.roles.includes('checker')
  ) );

let {aDealWithOneLoanAndOneBond} = require('../../../../../fixtures/transaction-dashboard-data');

context('View a deal', () => {
  beforeEach(() => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });

    // clear down our test users old deals, and insert a new one - updating our deal object
    cy.deleteDeals(MAKER_LOGIN);
    cy.insertOneDeal(aDealWithOneLoanAndOneBond, MAKER_LOGIN)
      .then((insertedDeal) => aDealWithOneLoanAndOneBond = insertedDeal);
  });

  it('A created deal appears on the transaction Dashboard', () => {
    // login and go to transactionDashboard
    cy.login(MAKER_LOGIN);
    transactionDashboard.visit();

    transactionDashboard.bankFacilityIDResults().should('contain', 'aDealWithOneLoanAndOneBond-bond1');
    transactionDashboard.bankFacilityIDResults().should('contain', 'aDealWithOneLoanAndOneBond-loan1');

    transactionDashboard.ukefFacilityIDResults().should('contain', 'ukef:aDealWithOneLoanAndOneBond-bond1');
    transactionDashboard.ukefFacilityIDResults().should('contain', 'ukef:aDealWithOneLoanAndOneBond-loan1');

    transactionDashboard.facilityTypeResults().should('contain', 'bond');
    transactionDashboard.facilityTypeResults().should('contain', 'loan');

    transactionDashboard.facilityValueResults().should('contain', 'GBP 123.00');
    transactionDashboard.facilityValueResults().should('contain', 'GBP 456.00');

    transactionDashboard.facilityStageResults().should('contain', 'Issued');
    transactionDashboard.facilityStageResults().should('contain', 'Conditional');

    transactionDashboard.facilityIssuedDateResults().should('contain', '17/09/2020');
    transactionDashboard.facilityIssuedDateResults().should('contain', '-');

    const makeFullName = `${MAKER_LOGIN.firstname} ${MAKER_LOGIN.surname}`;
    transactionDashboard.makerResults().should('contain', makeFullName);

    // not sure what should go here right now; checker who submitted the deal? checker who submitted a facility? don't know..
    // transactionDashboard.checkerResults().should('contain', '-');
    // transactionDashboard.checkerResults().should('contain', '-');
  });
});
