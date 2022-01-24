/*
const { facilitiesDashboard } = require('../../../../pages');

const mockUsers = require('../../../../../fixtures/mockUsers');
// slight oddity- this test seems to need a straight 'maker'; so filtering slightly more than in other tests..
const MAKER_LOGIN = mockUsers.find(
  (user) => (user.roles.includes('maker')
    && !user.roles.includes('admin')
    && !user.roles.includes('checker')
  ),
);

const { aDealWithOneLoanAndOneBond } = require('../../../../../fixtures/transaction-dashboard-data');

context('View a deal', () => {
  beforeEach(() => {
    // clear down our test users old deals, and insert a new one - updating our deal object
    cy.deleteDeals(MAKER_LOGIN);
    cy.insertOneDeal(aDealWithOneLoanAndOneBond, MAKER_LOGIN);
  });

  it('A created deal appears on the transaction Dashboard', () => {
    // login and go to transactionDashboard
    cy.login(MAKER_LOGIN);
    facilitiesDashboard.visit();

    const bondId = 'aDealWithOneLoanAndOneBond-bond1';
    const loanId = 'aDealWithOneLoanAndOneBond-loan1';

    facilitiesDashboard.bankFacilityId(bondId).should('contain', 'aDealWithOneLoanAndOneBond-bond1');
    facilitiesDashboard.bankFacilityId(loanId).should('contain', 'aDealWithOneLoanAndOneBond-loan1');

    facilitiesDashboard.ukefFacilityId(bondId).should('contain', 'ukef:aDealWithOneLoanAndOneBond-bond1');
    facilitiesDashboard.ukefFacilityId(loanId).should('contain', 'ukef:aDealWithOneLoanAndOneBond-loan1');

    facilitiesDashboard.type(bondId).should('contain', 'Bond');
    facilitiesDashboard.type(loanId).should('contain', 'Loan');

    facilitiesDashboard.noticeType(bondId).should('contain', 'Automatic Inclusion Notice');
    facilitiesDashboard.noticeType(loanId).should('contain', 'Automatic Inclusion Notice');

    facilitiesDashboard.facilityValue(bondId).should('contain', 'GBP 123.00');
    facilitiesDashboard.facilityValue(loanId).should('contain', 'GBP 456.00');

    facilitiesDashboard.bankStage(bondId).should('contain', 'Issued');
    facilitiesDashboard.bankStage(loanId).should('contain', 'Conditional');

    facilitiesDashboard.issuedDate(bondId).should('contain', '17 Sep 2020');
    facilitiesDashboard.issuedDate(loanId).should('contain', '-');
  });
});
*/
