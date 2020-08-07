const { dashboard } = require('../../../pages');
const relative = require('../../../relativeURL');

const mockUsers = require('../../../../fixtures/mockUsers');
// slight oddity- this test seems to need a straight 'maker'; so filtering slightly more than in other tests..
const MAKER_LOGIN = mockUsers.find( user=> (user.roles.includes('maker') && user.roles.length === 1) );

context('View a deal', () => {
  let deal;
  const dummyDeal = {
    details: {
      bankSupplyContractID: 'abc-1-def',
      bankSupplyContractName: 'Tibettan submarine acquisition scheme',
    },
  };

  beforeEach(() => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });

    // clear down our test users old deals, and insert a new one - updating our deal object
    cy.deleteDeals(MAKER_LOGIN);
    cy.insertOneDeal(dummyDeal, MAKER_LOGIN)
      .then((insertedDeal) => deal = insertedDeal);
  });

  it('A created deal appears on the dashboard', () => {
    // login and go to dashboard
    cy.login(MAKER_LOGIN);
    dashboard.visit();

    // get the row that corresponds to our deal
    const row = dashboard.row(deal);

    // check the fields we understand
    expect(dashboard.tableHeaders.bank().should('not.exist'));
    expect(row.bank().should('not.exist'));

    row.bankSupplyContractID().invoke('text').then((text) => {
      expect(text.trim()).equal('abc-1-def');
    });

    row.maker().invoke('text').then((text) => {
      expect(text.trim()).equal('Hugo Drax'); // MAKER firstname surname
    });

    const regexDateTime = /[\d][\d]\/[\d][\d]\/[\d][\d][\d][\d] [\d][\d]:[\d][\d]/;
    row.updated().invoke('text').then((text) => {
      // TODO - check formatting once formatting known
      expect(text.trim()).to.match(regexDateTime);
    });

    // submissionDate: '12/02/2020',
    // TODO - other fields as we start to populate them...


    row.bankSupplyContractID().contains('abc-1-def').click();

    cy.url().should('eq', relative(`/contract/${deal._id}`));

    //
  });
});
