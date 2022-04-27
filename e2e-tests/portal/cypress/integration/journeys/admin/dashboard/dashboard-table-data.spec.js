const { dashboardDeals, dashboardFacilities } = require('../../../pages');
const MOCK_USERS = require('../../../../fixtures/users');

const {
  GEF_DEAL_DRAFT,
  GEF_FACILITY_CASH,
  GEF_FACILITY_CONTINGENT,
} = require('../fixtures');

const { BANK1_MAKER1, ADMIN } = MOCK_USERS;

context('Admin dashboard', () => {
  let deal;
  const ALL_FACILITIES = [];

  const dummyDeal = {
    bankInternalRefName: 'abc-1-def',
    additionalRefName: 'Tibettan submarine acquisition scheme',
  };

  beforeEach(() => {
    cy.deleteDeals(ADMIN);
    cy.deleteGefApplications(ADMIN);
    // resets all facilities array
    ALL_FACILITIES.length = 0;

    cy.insertOneDeal(dummyDeal, BANK1_MAKER1)
      .then((insertedDeal) => { deal = insertedDeal; });

    cy.insertOneGefApplication(GEF_DEAL_DRAFT, BANK1_MAKER1).then((dealGef) => {
      const { _id: dealId } = dealGef;

      const facilities = [
        { ...GEF_FACILITY_CASH, dealId, name: 'Cash Facility name' },
        { ...GEF_FACILITY_CONTINGENT, dealId, name: 'Contingent Facility name' },
      ];

      cy.insertManyGefFacilities(facilities, BANK1_MAKER1).then((insertedFacilities) => {
        insertedFacilities.forEach((facility) => {
          ALL_FACILITIES.push(facility.details);
        });
      });
    });
  });

  it('Bank column should appear for admin user', () => {
    // login and go to dashboard
    cy.login(ADMIN);
    dashboardDeals.visit();

    // check the fields we understand
    expect(dashboardDeals.tableHeader('bankRef').should('exist'));
    expect(dashboardDeals.row.bankRef(deal._id).should('exist'));
  });

  it('renders all facilities (Admin)', () => {
    cy.login(ADMIN);
    dashboardFacilities.visit();
    dashboardFacilities.rows().should('be.visible');
    dashboardFacilities.row.nameLink(ALL_FACILITIES[0]._id).should('exist');
    dashboardFacilities.row.nameLink(ALL_FACILITIES[1]._id).should('exist');
    dashboardFacilities.rows().should('have.length', ALL_FACILITIES.length);
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
