const { transactionDashboard } = require('../../../../pages');
const relative = require('../../../../relativeURL');

const mockUsers = require('../../../../../fixtures/mockUsers');
const MAKER_LOGIN = mockUsers.find( user=> (user.roles.includes('maker')) );

// test data we want to set up + work with..
const transactionTestData = require('../../../../../fixtures/transaction-dashboard-data');

context('The Transactions dashboard', () => {
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
    cy.insertManyDeals(transactionTestData.all, MAKER_LOGIN)
      .then((insertedDeals) => deals = insertedDeals);
  });

  it('can be filtered by the "search" field which matches ukefId, or bond.uniqueIdentificationNumber, or loan.bankReferenceNumber', () => {
    cy.login(MAKER_LOGIN);
    transactionDashboard.visit();

    // no filter -> all data
    transactionDashboard.showFilters().click();
    transactionDashboard.search().type('{selectall}{backspace}');
    transactionDashboard.applyFilters().click();
    transactionDashboard.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal('(44 items)');
    });

    // prove starts-with case-insensitive search on ukefFacilityId vs bond
    transactionDashboard.showFilters().click(); // re-open the advanced search so we can use it..
    transactionDashboard.search().type('{selectall}{backspace}ukef:aDeAlWiThOnELoanandOneBond');
    transactionDashboard.applyFilters().click();
    transactionDashboard.ukefFacilityIDResults().should( (ukefId) => { expect(ukefId).to.contain("ukef:aDealWithOneLoanAndOneBond-bond1")});

    // prove starts-with case-insensitive search on UniqueIdNum vs bond
    transactionDashboard.search().type('{selectall}{backspace}aDeAlWiThOnELoanandOneBond');
    transactionDashboard.applyFilters().click();
    transactionDashboard.bankFacilityIDResults().should( (bankId) => { expect(bankId).to.contain("aDealWithOneLoanAndOneBond-bond1")});

    // prove starts-with case-insensitive search on ukefFacilityId vs loan
    transactionDashboard.search().type('{selectall}{backspace}ukef:adealwithoneLOANAndOneBOND');
    transactionDashboard.applyFilters().click();
    transactionDashboard.ukefFacilityIDResults().should( (ukefId) => { expect(ukefId).to.contain("ukef:aDealWithOneLoanAndOneBond-loan1")});

    // prove starts-with case-insensitive search on BankRefNum vs loan
    transactionDashboard.search().type('{selectall}{backspace}aDEALWithTENLoans-');
    transactionDashboard.applyFilters().click();
    transactionDashboard.bankFacilityIDResults().should( (bankId) => { expect(bankId).to.contain("aDealWithTenLoans-loan6")});

  });
});
