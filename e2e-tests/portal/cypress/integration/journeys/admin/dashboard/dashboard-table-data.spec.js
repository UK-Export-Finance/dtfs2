const { dashboardDeals } = require('../../../pages');

const mockUsers = require('../../../../fixtures/mockUsers');
const MOCK_USERS = require('../../../../fixtures/users');

const { BANK1_MAKER1, ADMIN } = MOCK_USERS;

context('Admin dashboard', () => {
  let deal;
  const dummyDeal = {
    bankInternalRefName: 'abc-1-def',
    additionalRefName: 'Tibettan submarine acquisition scheme',
  };

  beforeEach(() => {
    cy.deleteDeals(ADMIN);
    cy.deleteGefApplications(ADMIN);

    cy.insertOneDeal(dummyDeal, BANK1_MAKER1)
      .then((insertedDeal) => { deal = insertedDeal; });
  });

  it('Bank column should appear for admin user', () => {
    // login and go to dashboard
    cy.login(ADMIN);
    dashboardDeals.visit();

    // check the fields we understand
    expect(dashboardDeals.tableHeader('bankRef').should('exist'));
    expect(dashboardDeals.row.bankRef(deal._id).should('exist'));
  });

  // TODO: ADD lighthouse checks DTFS2-4994
  //   it('Dashboard screen should pass Lighthouse audit', () => {
  //     // login and go to dashboard
  //     cy.login(ADMIN_LOGIN);
  //     dashboardDeals.visit();

  //     cy.lighthouse({
  //       performance: 85,
  //       accessibility: 100,
  //       'best-practices': 85,
  //       seo: 85,
  //       pwa: 100,
  //     });
  //     cy.pa11y();
  //   });
});
