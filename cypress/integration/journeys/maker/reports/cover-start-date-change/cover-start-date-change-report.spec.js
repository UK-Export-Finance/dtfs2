const moment = require('moment');

const { reports, defaults } = require('../../../../pages');
const { coverStartDateReport } = reports;

const relative = require('../../../../relativeURL');

const mockUsers = require('../../../../../fixtures/mockUsers');
const MAKER_LOGIN = mockUsers.find( user=> (user.roles.includes('maker') && !user.roles.includes('admin')) );

// test data we want to set up + work with..
let {aDealWithOneBond, aDealWithOneLoan, aDealWithOneLoanAndOneBond} = require('../../../../../fixtures/transaction-dashboard-data');

const toBigNumber = (date) => {
  return moment(date, "YYYY-MM-DD").utc().valueOf().toString();
}

context('MIA MIN cover start date changes', () => {
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
      .then( (inserted) => {aDealWithOneBond = inserted});

    cy.insertOneDeal(aDealWithOneLoan, MAKER_LOGIN)
    .then( (inserted) => {aDealWithOneLoan = inserted});

    cy.insertOneDeal(aDealWithOneLoanAndOneBond, MAKER_LOGIN)
    .then( (inserted) => {aDealWithOneLoanAndOneBond = inserted});

  });

  it('can be filtered by create date', () => {
    cy.login(MAKER_LOGIN);
    coverStartDateReport.visit();

    // we've loaded 3 deals;
    //  one has a bond- no update- should not display
    //  one has a loan with an update- should display
    // one has a bond with an update, and a loan without an update
    //  therefore i expect to see 2 things; and this proves that
    //  i'm finding all the deals i should, and that i'm correctly
    //  filtering out the transactions that don't match
    coverStartDateReport.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal('(2 items)'); //based on the test data
    });

  });
});
