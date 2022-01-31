const { dashboardFacilities } = require('../../../../pages');
const {
  MOCK_DEALS,
  MOCK_FACILITIES,
  MOCK_USERS,
} = require('../fixtures');

const {
  BANK1_MAKER1,
  ADMIN,
} = MOCK_USERS;

const { BSS_DEAL } = MOCK_DEALS;
const { BOND_FACILITY } = MOCK_FACILITIES;

let ALL_FACILITIES;

context('Dashboard facilities pagination', () => {
  before(() => {
    cy.deleteGefApplications(ADMIN);
    cy.deleteDeals(ADMIN);

    cy.insertOneDeal(BSS_DEAL, BANK1_MAKER1).then((bssDeal) => {
      const twentyOneFacilities = Array.from(Array(21), () => BOND_FACILITY);

      cy.createFacilities(bssDeal._id, twentyOneFacilities, BANK1_MAKER1).then((createdFacilities) => {
        ALL_FACILITIES = createdFacilities;
      });
    });
  });

  after(() => {
    ALL_FACILITIES.forEach((facility) => {
      cy.deleteFacility(facility._id, ADMIN);
    });
  });

  it('displays 20 results per page, total number of items and working First/Previous/Next/Last links', () => {
    cy.login(BANK1_MAKER1);
    dashboardFacilities.visit();

    // test amount of rows
    dashboardFacilities.rows().should('have.length', 20);

    // test pagination
    dashboardFacilities.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal('(21 items)');
    });

    dashboardFacilities.first().should('not.exist');
    dashboardFacilities.previous().should('not.exist');
    dashboardFacilities.next().should('exist');
    dashboardFacilities.last().should('exist');

    // go to the next/last page
    dashboardFacilities.next().click();

    // test amount of rows
    dashboardFacilities.rows().should('have.length', 1);

    // test pagination
    dashboardFacilities.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal('(21 items)');
    });

    dashboardFacilities.first().should('exist');
    dashboardFacilities.previous().should('exist');
    dashboardFacilities.next().should('not.exist');
    dashboardFacilities.last().should('not.exist');
  });
});
