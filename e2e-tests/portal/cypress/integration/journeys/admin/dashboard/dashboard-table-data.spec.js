const { dashboard } = require('../../../pages');
const relative = require('../../../relativeURL');

const mockUsers = require('../../../../fixtures/mockUsers');

const ADMIN_LOGIN = mockUsers.find((user) => (user.roles.includes('admin')));
const MAKER_LOGIN = mockUsers.find((user) => (user.roles.includes('maker')));

context('Admin dashboard', () => {
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
    cy.deleteGefApplications(MAKER_LOGIN);
  });

  it('Bank column should appear for admin user', () => {
    // login and go to dashboard
    cy.login(ADMIN_LOGIN);
    dashboard.visit();

    // check the fields we understand
    expect(dashboard.tableHeader('bankRef').should('exist'));
    expect(dashboard.row.bankRef(deal._id).should('exist'));
  });

  it('Dashboard screen should pass Lighthouse audit', () => {
    // login and go to dashboard
    cy.login(ADMIN_LOGIN);
    dashboard.visit();

    cy.lighthouse({
      performance: 85,
      accessibility: 100,
      'best-practices': 85,
      seo: 85,
      pwa: 100,
    });
    cy.pa11y();
  });
});
